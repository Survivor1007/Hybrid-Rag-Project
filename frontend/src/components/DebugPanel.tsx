import type { DebugData } from "../types/types";

interface Props{
      data:DebugData | null
}

export default function DebugPanel({data}: Props){
      if(!data)return null

      return(
            <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-semibold bg-black-200 mb-3">
                        RAG Debug Panel
                  </h3>

                  <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300">
                              Retrieved Stats
                        </h4>

                        <p className="text-sm font-semibold text-gray-400">
                              Retrieved:{data.retrieved_docs.length}
                        </p>

                        <p className="text-sm font-semibold text-gray-400">
                              After reranked :{data.reranked_docs.length}
                        </p>

                  </div>
                  <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300">
                              Performance
                        </h4>

                        <p className="text-sm text-gray-400">
                              Retrieval: {(data.timing.retrieval_time * 1000).toFixed(3)} ms
                        </p>

                        <p className="text-sm text-gray-400">
                              Rerank: {(data.timing.rerank_time * 1000).toFixed(3)} ms
                        </p>

                        <p className="text-sm text-gray-400">
                              Generation: {(data.timing?.generation_time ?? 0 * 1000).toFixed(3)} ms
                        </p>

                        <p className="text-sm text-gray-400">
                              Top Score:{data.reranked_docs[0]?.score.toFixed(3)}
                        </p>

                  </div>

                  <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300">
                              Expanded Queries
                        </h4>

                        {data.expanded_queries.map((q, i) => (
                              <p  key={i} className="text-sm text-gray-400">
                                    {1 + i}.{q}
                              </p>
                        ))}
                  </div>

                  <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300">
                              Retrieved Documents
                        </h4>

                        {data.retrieved_docs.map((doc, i) => (
                              <p  key={i} className="text-sm text-gray-400">
                                    {doc.slice(0,120)}...
                              </p>
                        ))}
                  </div>

                  <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300">
                              Reranked Documents
                        </h4>
                        

                        {data.reranked_docs.map((doc, i) => (
                              <div  key={i} className="text-sm text-gray-400 mb-2">
                                    <p>{doc.content.slice(0,120)}...</p>
                                    <p className="text-xs text-gray-500">
                                          Score: {doc.score.toFixed(3)}
                                    </p>
                              </div>
                        ))}
                  </div>


            </div>
      )
}