import type { SourceDoc } from "../types/types";

interface Props{
      docs: SourceDoc[]
}

export default function SourceDocs({docs}: Props){
      
      if(!docs.length)return null

      return(
            <div style={{ marginTop: "15px" }}>
      <h4> Retrieved Sources</h4>

      {docs.map((doc, index) => (
        <div
          key={index}
          style={{
            background: "#1e1e1e",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            borderLeft:"4px solid #4facfe"
          }}
        >
          <p style={{ fontSize:"13px", opacity:"0.9"}}>
            {doc.content.slice(0, 200)}...
          </p>
        </div>
      ))}
    </div>
      )
}