import type { SourceDoc } from "../types/types";

interface Props{
      docs: SourceDoc[]
}

export default function SourceDocs({docs}: Props){
      if(!docs.length) return null

      return (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <h4 className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              Retrieved Sources
            </h4>
            <span className="ml-auto text-xs text-zinc-600 font-mono">{docs.length} chunk{docs.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex flex-col gap-2">
            {docs.map((doc, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-700/60 rounded-xl px-4 py-3 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-zinc-400 leading-relaxed flex-1">
                    {doc.content.slice(0, 200)}
                    <span className="text-zinc-600">…</span>
                  </p>
                  <span className="shrink-0 text-[10px] font-mono bg-zinc-800 border border-zinc-700 text-sky-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {doc.score.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
}
