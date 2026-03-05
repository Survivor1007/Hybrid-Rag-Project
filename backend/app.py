from fastapi import FastAPI
from pydantic import BaseModel
from services.pipeline import run_pipeline

app = FastAPI()

class QueryRequest(BaseModel):
      query: str


@app.post("/ask")
def ask_question(request: QueryRequest):
      result = run_pipeline(request.query)
      return result