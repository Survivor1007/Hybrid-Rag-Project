import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import MessageBubble from "./MessageBubble";
import SourceDocs from "./SourceDocs";
import  type { Message,SourceDoc } from "../types/types";

export default function ChatBox(){
      const [messages, setMessage] = useState<Message[]>([])
      const [input, setInput] = useState("")
      const [loading, setLoading] = useState(false)
      const [sources, setSources] = useState<SourceDoc[]>([])
      const messageEndRef = useRef<HTMLDivElement | null>(null);

      useEffect(() => {
            messageEndRef.current?.scrollIntoView({behavior:"smooth"});
      }),[messages,loading]

      const sendMessage = async () => {

            if(!input.trim)return

            const userMessage: Message = {
                  "role": "user",
                  content: input
            }

            setMessage(prev => [...prev,userMessage])
            setInput("")
            setLoading(true)


            try{

                  const response = await askQuestion(input)

                  const aiMessage: Message = {
                        role: "assistant",
                        content: response.answer
                  }

                  setMessage(prev => [...prev, aiMessage])
                  setSources(response.retrieved_documents)
            }catch(err){
                  console.error(err)
            }     

            setLoading(false)
      }

      return(
            <div className="w-full max-w-5xl">

            {/**Chat Container */}
            <div className="bg-black border border-gray-700 rounded-xl p-5">

            {/*Chat Message */}
      <div className="h-[400px] overflow-y-auto  mb-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
            <div className="opacity-70 italic text-gray-400 ">
                  Assistant is Thinking...
            </div>
      )}

      <div ref={messageEndRef}></div>
      </div>


      {/**Input Area */}
      <div className="flex gap-2 mb-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        onKeyDown = {(e) => {
            if(e.key === "Enter"){
                  sendMessage();
            }
        }}
        className="flex-1 p-3 rounded-lg bg-gray-800 text-white outline-none border border-gray-600"
      />

      <button onClick={sendMessage}
      className="px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold">Send</button>

      </div>
        <SourceDocs docs={sources} />
      </div>

      

    </div>
      )
}