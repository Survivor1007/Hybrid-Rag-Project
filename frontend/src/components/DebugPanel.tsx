import type { DebugData } from "../types/types";

interface Props{
      data:DebugData | null
}

export default function DebugPanel({data}: Props){
      if(!data) return null

      return (
        <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-800/40">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              RAG Debug Panel
            </h3>
          </div>

          <div className="p-4 space-y-5 max-h-96 overflow-y-auto">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Retrieved", value: data.retrieved_docs.length },
                { label: "Reranked", value: data.reranked_docs.length },
                { label: "Top Score", value: data.reranked_docs[0]?.score.toFixed(3) ?? "—" },
              ].map((stat) => (
                <div key={stat.label} className="bg-zinc-800 border border-zinc-700/60 rounded-xl px-3 py-2.5 text-center">
                  <p className="text-lg font-bold text-zinc-100 font-mono">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Timing */}
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-2">Performance</h4>
              <div className="space-y-1.5">
                {[
                  { label: "Retrieval", ms: data.timing.retrieval_time * 1000 },
                  { label: "Rerank", ms: data.timing.rerank_time * 1000 },
                  { label: "Generation", ms: (data.timing?.generation_time ?? 0) * 1000 },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{t.label}</span>
                    <span className="text-xs font-mono text-amber-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                      {t.ms.toFixed(1)} ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded queries */}
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-2">Expanded Queries</h4>
              <div className="space-y-1">
                {data.expanded_queries.map((q, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[10px] font-mono text-zinc-600 mt-0.5 shrink-0">{i + 1}.</span>
                    <p className="text-xs text-zinc-400 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Retrieved docs */}
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-2">Retrieved Documents</h4>
              <div className="space-y-2">
                {data.retrieved_docs.map((doc, i) => (
                  <div key={i} className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-3 py-2">
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                      {doc.slice(0, 120)}<span className="text-zinc-600">…</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reranked docs */}
            <div>
              <h4 className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-2">Reranked Documents</h4>
              <div className="space-y-2">
                {data.reranked_docs.map((doc, i) => (
                  <div key={i} className="bg-zinc-800/60 border border-zinc-700/40 rounded-lg px-3 py-2">
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                      {doc.content.slice(0, 120)}<span className="text-zinc-600">…</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div
                        className="h-1 rounded-full bg-emerald-500/60"
                        style={{ width: `${Math.min(doc.score * 100, 100)}%`, maxWidth: "100%" }}
                      />
                      <span className="text-[10px] font-mono text-emerald-500 shrink-0">{doc.score.toFixed(3)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )
}
