import type { Message } from "../types/types";
import ReactMarkdown from "react-markdown";

interface Props{
      message: Message
}

export default function MessageBubble({message}: Props){
      const isUser = message.role === "user"

      return (
            <div
     className={`flex mb-3 w-full  ${isUser? "justify-end" : "justify-start"}`}
    >
      <div
        className={`px-4 py-3 rounded-xl max-w-[65%] text-sm leading-relaxed shadow 
          ${isUser? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900" }`}
      >

        <ReactMarkdown>
          {message.content}
        </ReactMarkdown>
        
      </div>
    </div>
      )
}