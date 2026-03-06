from fastapi import FastAPI
from pydantic import BaseModel
from services.pipeline import run_pipeline
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
      CORSMiddleware, 
      allow_origins=["*"],
      allow_credentials=True,
      allow_headers=["*"],
      allow_methods=["*"]

)

class QueryRequest(BaseModel):
      query: str


@app.post("/ask")
def ask_question(request: QueryRequest):
      result = run_pipeline(request.query)
      return result