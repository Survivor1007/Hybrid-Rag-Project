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
      temperature=0.2
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

      for q in [query] + expanded_query:
            doc = retriever.retrieve(query=q)
            all_docs.extend(doc)
      
      unique_docs = list({doc.page_content: doc for doc in all_docs}.values())

      if not unique_docs:
            return {
                  "answer": "I don't know the answer based on the given instructions",
                  "expanded_query": expanded_query,
                  "retrieved documents": []
            }
      
      reranked_results = reranker.rerank(query, unique_docs)

      SCORE_THRESHOLD = 0.2

      filtered = [
            (doc, score)
            for doc, score in reranked_results
            if score > SCORE_THRESHOLD
      ]

      top_documents = filtered[:3]

      context = "\n\n".join(doc.page_content for doc,_ in top_documents)

      history = memory.get_context()

      prompt = f"""
You are a precise and factual AI Assistant.

Conversation History:
{history}

Answer only using the context given below.

Context:
{context}

Question:
{query}

Answer:

"""
      sources = [
            {
                  "content" : doc.page_content,
                  "score" : float(score)
            }
            for doc, score in top_documents
      ]

      answer = ""

      #=============SEND LLM RESULT==========
      for chunk in llm.stream(prompt):
            token = chunk
            answer += token
            yield token

      memory.add(query, answer)

      #============SEND MARKER=================   
      yield("\n[[SOURCES]]\n")

      yield json.dumps(sources)
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
