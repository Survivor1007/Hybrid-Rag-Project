from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.config import CHUNK_SIZE, CHUNK_OVERLAP

def load_document(path):
      with open(path, "r", encoding="utf-8") as file:
            return file.read()

def split_document(text, path):
      splitter = RecursiveCharacterTextSplitter(
            chunk_size = CHUNK_SIZE,
            chunk_overlap = CHUNK_OVERLAP
      )
      
      documents = splitter.create_documents(
            [text], 
            metadatas=[{"source": path}]
      )
      return documents

def ingest(path):
      text = load_document(path)
      chunks = split_document(text, path)
      return chunks
            