// import type { RAGResponse } from "../types/types";

export async function askQuestion(query: string): Promise<RAGResponse> {
      const response = await fetch("http://127.0.0.1:8000/ask", {
            method:"POST",
            headers:{
                  "Content-Type":"application/json"
            },
            body: JSON.stringify({query})
      });

      

      if(!response.ok){
            throw new Error("API ERROR")
      }

      return response;
}