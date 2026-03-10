Hybrid RAG Assistant

A Hybrid Retrieval-Augmented Generation (RAG) document question-answering system that allows users to upload documents and ask questions about them.

The system retrieves relevant document chunks using hybrid search (BM25 + dense vectors) and generates answers using a local LLM via Ollama, while providing full transparency of the retrieval pipeline through a debug panel.

This project demonstrates a production-style RAG pipeline with query expansion, reranking, hallucination control, and streaming responses in a full-stack AI application.



The interface allows users to:

Upload documents

Ask questions about them

View generated answers

See the retrieved sources used by the model

Inspect the internal RAG pipeline through the debug panel

Key Features
Hybrid Retrieval (BM25 + Dense Vector Search)

The system combines:

BM25 lexical search

Dense vector similarity search

This hybrid approach improves both precision and recall, ensuring relevant document chunks are retrieved even when wording differs.

Query Expansion

Before retrieval, the system generates multiple expanded versions of the user query using an LLM.

Example:

User Query:
Explain program counter

Expanded Queries:
1. What is the current value of the program counter?
2. How does the program counter affect program execution?
3. What happens when the program counter reaches the end of a program?

This improves retrieval coverage.

Cross-Encoder Reranking

Retrieved document chunks are reranked using a cross-encoder model that evaluates the query and document together.

This improves semantic relevance before passing context to the LLM.

Hallucination Guard

Low-confidence results are filtered using a score threshold.

If relevant context is insufficient, the system avoids generating unsupported answers.

Streaming Responses

LLM responses are streamed token-by-token to the frontend, providing a real-time chat experience.

Document Management

Users can:

Upload documents

Remove documents

Ask questions across the uploaded corpus

Source Citations

Answers include retrieved document chunks and relevance scores, helping users verify the origin of information.

Example:

Retrieved Sources
Registers: High-speed internal storage for instructions...
Score: 1.799
RAG Debug Panel

One of the key features of the system is the debug panel, which exposes the internal workings of the RAG pipeline.

Displayed information includes:

Retrieval Statistics

Retrieved: 5
After rerank: 1

Performance Metrics

Retrieval: 61 ms
Rerank: 93 ms
Generation: 23 ms
Top Score: 1.799

Expanded Queries

1. What is the current value of the program counter?
2. How does the program counter affect the execution of a program?
3. What happens when the program counter reaches the end of the program?

Retrieved Documents

Shows document chunks retrieved from the corpus.

Reranked Documents

Displays the final document chunks used as context.

This panel makes the system highly transparent and useful for debugging RAG pipelines.

RAG Pipeline Architecture

flowchart LR

A[User Query] --> B[Query Expansion]

B --> C[Hybrid Retrieval]

C --> C1[BM25 Search]
C --> C2[Dense Vector Search]

C1 --> D[Merge Results]
C2 --> D

D --> E[Deduplication]

E --> F[Cross Encoder Reranker]

F --> G[Score Threshold Filter]

G --> H[Context Construction]

H --> I[LLM Generation - Ollama]

I --> J[Streaming Response]

J --> K[React Chat UI]

subgraph Debug Panel
B
C
F
end



Tech Stack
Backend

Python

FastAPI

LangChain

Ollama (local LLM)

rank-bm25

Dense vector embeddings

Cross-encoder reranker

Frontend

React

TypeScript

TailwindCSS

Project Structure
hybrid-rag-assistant
│
├── backend
│   ├── main.py
│   ├── rag
│   │   ├── pipeline.py
│   │   ├── retriever.py
│   │   ├── reranker.py
│   │   └── query_expansion.py
│   │
│   ├── services
│   │   ├── embeddings.py
│   │   └── document_store.py
│   │
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── ChatUI.tsx
│   │   │   ├── DebugPanel.tsx
│   │   │   └── DocumentManager.tsx
│   │   │
│   │   ├── services
│   │   │   └── api.ts
│   │   │
│   │   └── App.tsx
│   │
│   └── package.json
│
└── README.md
Setup Instructions
Prerequisites

Python 3.9+

Node.js 18+

Ollama installed

Install a local model:

ollama pull llama3
Backend Setup
cd backend

python -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run the server:

uvicorn main:app --reload

Backend runs at:

http://localhost:8000
Frontend Setup
cd frontend

npm install
npm run dev

Frontend runs at:

http://localhost:5173
Example Workflow

Upload a document

Ask a question

System expands the query

Hybrid retrieval finds relevant chunks

Cross-encoder reranks the results

Context is passed to the LLM

The answer is generated and streamed

Retrieved sources and debug information are displayed

Future Improvements



Potential enhancements:

Persistent vector database (FAISS / Chroma / Qdrant)

Multi-document conversation memory

Improved chunking strategies

Metadata filtering

RAG evaluation metrics

Docker deployment

Authentication system

Multi-modal document support (PDFs, images)