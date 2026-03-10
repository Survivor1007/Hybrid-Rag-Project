import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import MessageBubble from "./MessageBubble";
import SourceDocs from "./SourceDocs";
import { type DebugData, type Message,type SourceDoc } from "../types/types";
import DebugPanel from "./DebugPanel";

export default function ChatBox(){
      const [messages, setMessage] = useState<Message[]>([])
      const [input, setInput] = useState("")
      const [loading, setLoading] = useState(false)
      const [sources, setSources] = useState<SourceDoc[]>([])
      const chatContainerRef = useRef<HTMLDivElement | null>(null);
      const [documents, setDocuments] = useState<string[]>([])
      const [uploading, setUploading] = useState(false)
      const [debugData, setDebugData] = useState<DebugData | null>(null);

      useEffect(() => {
           if(chatContainerRef.current){
            chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
           }
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

                  const reader = response.body?.getReader()
                  const decoder = new TextDecoder()

                  let done = false
                  let streamedText = ""

                  let sourcesText = ""
                  let readingSources = false

                  let debugText = ""
                  let readingDebug = false



                  //empty assistant message
                  setMessage(prev => [...prev, {role:"assistant",content:""}])

                  while(!done)
                  {
                        const {value,done: doneReading} = await reader!.read()
                        done = doneReading

                        const chunk = decoder.decode(value)

                        if(chunk.includes("[[SOURCES]]")){
                              readingSources = true
                              readingDebug = false
                              continue
                        }
                        if(chunk.includes("[[DEBUG]]")){
                              readingSources = false
                              readingDebug = true
                              continue
                        }
                        

                        if(readingSources){
                              sourcesText += chunk
                        }
                        else if(readingDebug){
                              debugText += chunk
                        }
                        else{

                              streamedText += chunk


                              setMessage(prev => {
                                    const updated  = [...prev]
                                    updated[updated.length - 1] = {
                                          role : 'assistant',
                                          content: streamedText
                                    }
                                    return updated
                              })
                        }
                  }
                  if(sourcesText){
                        setSources(JSON.parse(sourcesText))
                  }

                  if(debugText){
                        setDebugData(JSON.parse(debugText))
                  }
                 
                  

                  
            }catch(err){
                  console.error(err)
            }     

            setLoading(false)
      }

      const fetchdocuments = async() => {
            const res = await fetch("http://127.0.0.1:8000/documents")
            const data = await res.json()
            setDocuments(data.documents)
      }

      useEffect(() => {
            fetchdocuments()
      }, [])

      const uploadFile = async (file: File) => {
            
            if(documents.length > 2){
                  alert("Maximum 2 documents  supported")
                  return
            }

            const formData = new FormData()

            formData.append("file", file)

            setUploading(true)

            await fetch("http://127.0.0.1:8000/upload",{
                  method: "POST",
                  body: formData
            })

            setUploading(false)

            fetchdocuments()
            
      }

      
      const removeDocument = async (name: string) => {
            await fetch(`http://127.0.0.1:8000/document/${name}`,{
                  method: "DELETE"
            })

            fetchdocuments()
      }

      return(
            <div className="w-full max-w-5xl">

                  <div className="mb-6">

                        <h3 className="text-sm text-gray-300 mb-3">
                              Uploaded Documents
                        </h3>

                        {/* Document List */}
                        {documents.length > 0 && (
                        <div className="space-y-2 mb-3">
                              {documents.map((doc, index) => (
                              <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-md"
                              >
                              <span className="text-sm text-gray-200 truncate">
                                   📄 {doc}
                              </span>

                              <button
                                    onClick={() => removeDocument(doc)}
                                    className="text-red-400 hover:text-red-300 text-xs"
                              >
                                    Remove
                              </button>
                              </div>
                              ))}
                        </div>
                        )}

                        {/* Upload Input */}
                        {documents.length < 2 && (
                        <div>
                              <input
                              type="file"
                              accept=".pdf,.txt"
                              onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                          uploadFile(e.target.files[0])
                                          e.target.value = ""
                                    }
                              }}
                              className="text-sm text-gray-200"
                              />
                        </div>
                        )}

                        {/* Limit Warning */}
                        {documents.length >= 2 && (
                        <p className="text-xs text-gray-400">
                              Maximum 2 documents uploaded
                        </p>
                        )}

                        {/* Upload Status */}
                        {uploading && (
                        <p className="text-xs text-gray-400 mt-2">
                              Uploading and indexing documents...
                        </p>
                        )}

                  </div>

                  {/**Chat Container */}
                  <div  ref = {chatContainerRef} className="bg-black border border-gray-700 rounded-xl p-5">

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
                        className="px-5 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold">Send
                  </button>

                  </div>
                        <SourceDocs docs={sources} />

                        <DebugPanel data={debugData} />
                  </div>

            

            </div>
      )
}