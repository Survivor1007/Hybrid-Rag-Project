export interface SourceDoc{
      content:string,
      score: number
}

export interface RAGResponse{
      answer: string,
      expanded_query:string[],
      retrieved_documents: SourceDoc[]
}

export interface Message{
      role: "user" | "assistant",
      content:string
}