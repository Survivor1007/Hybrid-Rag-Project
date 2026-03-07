import type { SourceDoc } from "../types/types";

interface Props{
      docs: SourceDoc[]
}

export default function SourceDocs({docs}: Props){
      
      if(!docs.length)return null

      return(
            <div className="mt-4">
      <h4 className="text-sm mb-2 font-semibold text-gray-300">
         Retrieved Sources
      </h4>

      {docs.map((doc, index) => (
        <div
          key={index}
          className="bg-gray-800 p-3  rounded-lg border border-gray-700"
        >
          <p className="text-sm text-gray-300">
            {doc.content.slice(0, 200)}...
          </p>

          <p className="text-xs text-gray-500 mt-1">
            score:{doc.score.toFixed(3)}
          </p>
        </div>
      ))}
    </div>
      )
}