from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from core.config import EMBEDDING_MODEL

def create_vector_store(chunks):
      embeddings = HuggingFaceEmbeddings(
            model = EMBEDDING_MODEL
      )
      vector_store = FAISS.from_documents(
            chunks, 
            embeddings
      )

      return vector_store