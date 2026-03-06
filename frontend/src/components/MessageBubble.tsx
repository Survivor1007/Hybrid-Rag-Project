import type { Message } from "../types/types";

interface Props{
      message: Message
}

export default function MessageBubble({message}: Props){
      const isUser = message.role === "user"

      return (
            <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        width:"100%",
        
      }}
    >
      <div
        style={{
          background: isUser ? "#2563eb" : "#f1f5f9",
          color:isUser?"white":"#111827",
          padding: "12px  14px",
          borderRadius: "14px",
          maxWidth: "65%",
          fontSize:"14px",
          lineHeight:"1.5",
          boxShadow:"0 2px 6px rgba(0, 0, 0, 0.08)",
          wordBreak:"break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {message.content}
      </div>
    </div>
      )
}