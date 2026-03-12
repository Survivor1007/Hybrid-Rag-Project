import type { Message } from "../types/types";
import ReactMarkdown from "react-markdown";

interface Props{
      message: Message
}

export default function MessageBubble({message}: Props){
      const isUser = message.role === "user"

      return (
        <div className={`flex mb-2 w-full ${isUser ? "justify-end" : "justify-start"}`}>
          <div
            className={`
              px-4 py-3 rounded-2xl max-w-[70%] text-sm leading-relaxed
              ${isUser
                ? "bg-white text-zinc-900 rounded-br-sm shadow-lg"
                : "bg-zinc-800 border border-zinc-700/60 text-zinc-100 rounded-bl-sm"
              }
            `}
          >
            {!isUser && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center text-[9px]">✦</div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Assistant</span>
              </div>
            )}
            <ReactMarkdown
              components={{
                p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                code: ({children}) => (
                  <code className={`font-mono text-xs px-1.5 py-0.5 rounded ${isUser ? "bg-zinc-200 text-zinc-800" : "bg-zinc-900 text-emerald-400 border border-zinc-700"}`}>
                    {children}
                  </code>
                ),
                pre: ({children}) => (
                  <pre className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 overflow-x-auto my-2 text-xs">{children}</pre>
                ),
                ul: ({children}) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                strong: ({children}) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      )
}
