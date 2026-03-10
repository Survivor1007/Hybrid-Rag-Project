from langchain_ollama import OllamaLLM
from rank_bm25 import BM25Okapi

from core.config import MODEL_NAME, TOP_K
from core.ingestion import ingest
from core.retriever import HybridRetriever
from core.reranker import CrossEncoderReranker
from core.vector_store import create_vector_store
from core.memory import ConversationMemory
import os
import json
import time

#==================
#LOAD EVERYTHING 
#==================

chunks = []
bm25 = None
vector_store = None
uploaded_files = []

def add_document(path):
      global chunks, bm25, vector_store, uploaded_files

      if len(uploaded_files) >= 2:
            raise Exception("Maximum of 2 files upload supported")


      

      uploaded_files.append(os.path.basename(path))


      new_chunks = ingest(path=path)
      chunks.extend(new_chunks)

      bm25_corpus = [doc.page_content for doc in chunks]
      tokenized_bm25 = [doc.split() for doc in bm25_corpus]

      bm25  = BM25Okapi(tokenized_bm25)

      vector_store = create_vector_store(chunks)


      retriever.chunks = chunks
      retriever.bm25 = bm25
      retriever.vector_store = vector_store



def remove_document(name):
      global chunks, vector_store, bm25, uploaded_files

      uploaded_files = [doc for doc in uploaded_files if name not in doc]

      chunks = []

      for file  in uploaded_files:
            path = os.path.join("data",file)
            chunks.extend(ingest(path))
      
      if not chunks:
            bm25 = None
            vector_store = None
            return
      
      bm25_corpus = [doc.page_content for doc in chunks]
      tokenized_bm25 = [doc.split() for doc in bm25_corpus]

      bm25  = BM25Okapi(tokenized_bm25)
      vector_store = create_vector_store(chunks)


      retriever.chunks = chunks
      retriever.bm25 = bm25
      retriever.vector_store = vector_store

      

retriever = HybridRetriever(
      chunks=chunks, 
      vector_store=vector_store,
      bm25=bm25,
      top_k=TOP_K
)

reranker = CrossEncoderReranker()

llm = OllamaLLM(
      model=MODEL_NAME,
      temperature=0
)

memory = ConversationMemory()

def generate_query_expansion(query, n=3):

     

      prompt = f"""
Generate {n} short alternative search queries
for the question below.

Rules:
- Each must be under 10 words.
- Do NOT explain.
- Just return them as numbered lines.
- No extra commentary.

Question: {query}
"""
      

      response = llm.invoke(prompt)

      lines = response.split('\n')
      expansions = []

      for line in lines:
            line = line.strip()
            if not line:
                  continue

            if line[0].isdigit():
                  line = line.split('.', 1)[1].strip()
                  line = line.split(')', 1)[-1].strip()

            expansions.append(line)

      return expansions[:n]


def run_pipeline_stream(query: str):
      expanded_query = generate_query_expansion(query, 3)

      all_docs = []


      retriever_start = time.time()

      for q in [query] + expanded_query:
            doc = retriever.retrieve(query=q)
            all_docs.extend(doc)

      retriever_time = time.time() - retriever_start
      
      unique_docs = list({doc.page_content: doc for doc in all_docs}.values())

      if not unique_docs:
            yield "I cannot find the answer in the provided documents."
            return 
      
      rerank_start = time.time()

      reranked_results = reranker.rerank(query, unique_docs)

      rerank_time = time.time() - rerank_start


      if not reranked_results:
            yield "I cannot find the answer in the provided documents."
            return
      
      top_score = reranked_results[0][1]
      print(f"Top ranked result:{top_score}")

      if  reranked_results[0][1] < 0.25:
            yield "I cannot find the answer in the provided documents."
            return

      SCORE_THRESHOLD = 0.2

      filtered = [
            (doc, score)
            for doc, score in reranked_results
            if score > SCORE_THRESHOLD
      ]

      if  not filtered:
            yield "I cannot find the answer in the provided documents."
            return

     

      context =""
      top_documents = filtered[:3]

      for i, doc in enumerate(top_documents):
            context += f"[{i+1}] {doc[0]}\n\n"

      history = memory.get_context()
      history = history[-4:]

      prompt = f"""
You are a retrieval-augmented AI assistant.

IMPORTANT RULES:
- Answer ONLY using the provided context.
- If the answer is not present in the context, reply:
  "I cannot find the answer in the provided documents."
- Do NOT use outside knowledge.

---------------------
Conversation History
---------------------
{history}

---------------------
Context Documents
---------------------
{context}

---------------------
User Question
---------------------
{query}

---------------------
Answer
---------------------
"""
      
      print(prompt)

      sources = [
            {
                  "content" : doc.page_content,
                  "score" : float(score)
            }
            for doc, score in top_documents
      ]

      answer = ""


      generation_start = time.time()

      #=============SEND LLM RESULT==========
      for chunk in llm.stream(prompt):
            token = chunk
            answer += token
            yield token

      generation_time = time.time() - generation_start

      memory.add(query, answer)


      debug_data = {
            "timing":{
                  "retrieval_time":round(retriever_time,3),
                  "rerank_time":  round(rerank_time,3),
                  "generation_time": round(generation_time,3)
            },
            "expanded_queries" : expanded_query,
            "retrieved_docs" : [
                  doc.page_content[:200]
                  for doc in unique_docs[:5]
            ],
            "reranked_docs":[
                  {
                        "content" :doc.page_content[:200],
                        "score": float(score)
                  }
                  for doc, score in filtered[:5]
            ]
      }

      #============SEND MARKER=================   
      yield("\n[[SOURCES]]\n")
      yield json.dumps(sources)


      yield("\n[[DEBUG]]\n\n")
      yield json.dumps(debug_data)




      # answer = llm.invoke(prompt)

      # memory.add(query, answer)

      # return {
      #       "answer": answer,
      #       "expanded_query": expanded_query,
      #       "retrieved_documents":[
      #             {
      #                   "content": doc.page_content,
      #                   "score": float(score)
      #             }
      #             for doc, score in top_documents
      #       ]
      # }
