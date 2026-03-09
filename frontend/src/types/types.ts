export interface SourceDoc{
      content:string,
      score: number
}

// export interface RAGResponse{
//       answer: string,
//       expanded_query:string[],
//       retrieved_documents: SourceDoc[]
// }

export interface Message{
      role: "user" | "assistant",
      content:string
}

export interface DebugData{
      timing: {
            retrieval_time: number,
            rerank_time: number,
            generation_time: number
      }
      expanded_queries: string[],
      retrieved_docs: string[],
      reranked_docs: {
            content: string,
            score: number
      }[]
}