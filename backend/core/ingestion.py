from langchain_text_splitters import RecursiveCharacterTextSplitter
from core.config import CHUNK_SIZE, CHUNK_OVERLAP
from pypdf import PdfReader

def load_document(path):
     
      if path.endswith(".txt"):
           with open(path, "r", encoding="utf-8") as file:
                 return file.read()
      elif path.endswith(".pdf"):
            reader = PdfReader(path)
            text = ""

            for page in reader.pages:
                  text += page.extract_text()
            
            return text
      else:
            raise ValueError("Unsupported File Format")
           
      
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
            