import { useState } from "react";
import { askQuestion } from "../services/api";
import MessageBubble from "./MessageBubble";
import SourceDocs from "./SourceDocs";
import  type { Message,SourceDoc } from "../types/types";

export default function ChatBox(){
      const [messages, setMessage] = useState<Message[]>([])
      const [input, setInput] = useState("")
      const [loading, setLoading] = useState(false)
      const [sources, setSources] = useState<SourceDoc[]>([])

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
                        role: "asistant",
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
            <div style={{ width: "600px", margin: "auto" }}>

      <div style={{ 
            height: "400px",
            overflowY: "auto",
            background:"#000000",
            padding:"20px",
            borderRadius:"10px",
            marginBottom:"20px",

              }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
            <div style={{opacity:0.7, fontStyle:"italic"}}>
                  Assistant is Thinking...
            </div>
      )}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        onKeyDown = {(e) => {
            if(e.key === "Enter"){
                  sendMessage();
            }
        }}
        style={{ flex: 1, padding: "12px",
            borderRadius:"12px",
            border:"none",
            width:"490px",
            outline: "none",
            background:"2b2b2b",
            color:"white",
         }}
      />

      <button onClick={sendMessage}
      style={{
            padding: "12px 20px",
            borderRadius:"8px",
            border:"none",
            background:"#4facfe",
            color:"white",
            fontWeight:"bold",
            cursor:"pointer",
      }}>Send</button>

      <SourceDocs docs={sources} />

    </div>
      )
}