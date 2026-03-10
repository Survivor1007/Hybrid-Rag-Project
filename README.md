Hybrid RAG System
A Retrieval-Augmented Generation (RAG) system built with FastAPI, LangChain, Ollama, and React that demonstrates modern document-based question answering.
This project implements a production-style RAG pipeline with hybrid retrieval, reranking, streaming responses, and debugging observability.
Features
Retrieval System
Hybrid Retrieval (BM25 + Dense Vector Search)
Query Expansion using LLM
Document Deduplication
Cross-Encoder Reranking
Generation
Streaming LLM responses
Context-grounded answering
Hallucination prevention using score threshold
Conversation memory
Frontend
Chat interface
Streaming responses
Source citations
Document scores
Debug panel
Observability
Query expansion visualization
Retrieved documents preview
Reranked documents with scores
Retrieval / rerank / generation timing
Architecture
Mermaid
Copy code
flowchart TD

A[User Query] --> B[Query Expansion]
B --> C[Hybrid Retrieval]

C --> D1[BM25 Retrieval]
C --> D2[Vector Retrieval]

D1 --> E[Merge Results]
D2 --> E

E --> F[Deduplicate Documents]

F --> G[Cross Encoder Reranking]

G --> H{Score Threshold}

H -->|Low Score| I[Refuse Answer]

H -->|Relevant| J[Context Construction]

J --> K[LLM Generation]

K --> L[Streaming Response]

L --> M[Frontend Chat UI]

G --> N[Debug Panel]

N --> O[Retrieval Stats]
N --> P[Rerank Scores]
N --> Q[Expanded Queries]
N --> R[Timing Metrics]
Tech Stack
Backend
FastAPI
LangChain
Ollama (Local LLM)
BM25 (rank-bm25)
Cross Encoder Reranker
Frontend
React
TypeScript
TailwindCSS
Vector Storage
Local vector store for embeddings
Project Structure
Copy code

backend/
 ├── core/
 │   ├── config.py
 │   ├── ingestion.py
 │   ├── retriever.py
 │   ├── reranker.py
 │   ├── vector_store.py
 │   └── memory.py
 │
 ├── services/
 │   └── pipeline.py
 │
 ├── data/
 │
 └── app.py


frontend/
 ├── components/
 │   ├── ChatBox.tsx
 │   ├── SourceDocs.tsx
 │   └── DebugPanel.tsx
 │
 ├── services/
 │   └── api.ts
 │
 └── types/


 
RAG Pipeline
User submits a query
Query expansion generates alternative search queries
Hybrid retrieval retrieves candidate documents
BM25 lexical search
Dense vector search
Retrieved documents are merged and deduplicated
Cross-encoder reranking scores document relevance
Score threshold filters irrelevant results
Relevant documents form the context
LLM generates an answer using the context
Response is streamed to the frontend




Debug Panel
The debug panel provides transparency into the RAG pipeline.
It displays:
Query expansions
Retrieved documents
Reranked documents with scores
Retrieval timing
Rerank timing
Generation timing
This helps analyze the performance and behavior of the system.


Installation
Backend
Bash
Copy code
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
Start the server
Bash
Copy code
uvicorn app:app --reload
Frontend
Bash
Copy code
cd frontend

npm install
npm run dev
Usage
Upload documents
Ask questions related to the documents
View:
streaming answers
source citations
debug pipeline data
Example
User Question
Copy code

What is FastAPI?
System Response
Copy code

FastAPI is a modern Python web framework used for building APIs efficiently.
Sources
Copy code

Source 1 (Score: 0.87)
FastAPI is a modern Python framework designed for building APIs...
Key Concepts Demonstrated
Retrieval-Augmented Generation
Hybrid Search
Cross Encoder Reranking
LLM Streaming
Hallucination Mitigation
Observability in AI pipelines
Future Improvements
Potential improvements:
Semantic chunk highlighting
Document metadata filtering
Evaluation metrics for retrieval quality
Support for larger document collections