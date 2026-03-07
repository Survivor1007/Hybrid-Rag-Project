import ChatBox from "./components/ChatBox";


function App(){
  return(
    // <div className="h-screen bg-slate-900 text-white flex items-center justify-center text-3xl">
    //   TailwindCSS Working 
    // </div>
    <div className="min-h-screen big-slate flex flex-col py-10 items-center">
      <h1 className="text-3xl font-bold text-white mb-4 " >
        Hybrid RAG Assistant
      </h1>
      <ChatBox/>
    </div>
  )
}


export default App