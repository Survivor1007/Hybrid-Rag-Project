from fastapi import FastAPI
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
import shutil
import os

from pydantic import BaseModel
from services.pipeline import run_pipeline_stream
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

os.makedirs("data", exist_ok=True)

app.add_middleware(
      CORSMiddleware, 
      allow_origins=["*"],
      allow_credentials=True,
      allow_headers=["*"],
      allow_methods=["*"]

)

class QueryRequest(BaseModel):
      query: str


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

      from services.pipeline import add_document

      file_path = f"data/{file.filename}"

      with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
      

      add_document(file_path)

      return {"message" : "Document uploaded and indexed"}

@app.post("/ask")
def ask_question(request: QueryRequest):
      generator = run_pipeline_stream(request.query)
      return StreamingResponse(generator, media_type = "text/plain")


@app.get("/documents")
def list_documents():
      from services.pipeline import uploaded_files

      return {"documents": uploaded_files}


@app.delete("/document/{doc_name}")
def delete_document(doc_name:str):

      from services.pipeline import remove_document

      remove_document(doc_name)
      return {"message": "Document removed"}