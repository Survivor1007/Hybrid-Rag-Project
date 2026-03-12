import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../services/api";
import MessageBubble from "./MessageBubble";
import SourceDocs from "./SourceDocs";
import { type DebugData, type Message, type SourceDoc } from "../types/types";
import DebugPanel from "./DebugPanel";

export default function ChatBox() {
  const [messages, setMessage] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<SourceDoc[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [debugData, setDebugData] = useState<DebugData | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }),
    [messages, loading];

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage: Message = { role: "user", content: input };

  // Add BOTH messages at once
  setMessage((prev) => [
    ...prev,
    userMessage,
    { role: "assistant", content: "" }   // ← placeholder
  ]);

  setInput("");
  setLoading(true);
    try {
      const response = await askQuestion(input);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
            let streamedText = "";
      let sourcesText = "";
      let debugText = "";
      let readingSources = false;
      let readingDebug = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader!.read();
        done = doneReading;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        buffer += chunk;

        // Handle markers
        if (buffer.includes("<<SOURCES>>")) {
          const parts = buffer.split("<<SOURCES>>");
          streamedText += parts[0];
          setMessage((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: streamedText };
            return updated;
          });
          buffer = parts[1];
          readingSources = true;
          readingDebug = false;
          continue;
        }

        if (buffer.includes("<<DEBUG>>")) {
          const parts = buffer.split("<<DEBUG>>");
          sourcesText += parts[0];           // flush any pending sources
          buffer = parts[1];
          readingSources = false;
          readingDebug = true;
          continue;
        }

        // Normal accumulation
        if (buffer.length > 0) {
          if (readingSources) {
            sourcesText += buffer;
            buffer = "";
          } else if (readingDebug) {
            debugText += buffer;
            buffer = "";
          } else {
            streamedText += buffer;
            buffer = "";
            setMessage((prev) => {
  console.log("Updating assistant - current messages:", prev);
  const updated = [...prev];
  updated[updated.length - 1] = { role: "assistant", content: streamedText };
  return updated;
});
            // setMessage((prev) => {
            //   const updated = [...prev];
            //   updated[updated.length - 1] = { role: "assistant", content: streamedText };
            //   return updated;
            // });
          }
        }
      }

      // FINAL FLUSH - critical for the last debug JSON
      if (buffer.length > 0) {
        if (readingDebug) debugText += buffer;
        else if (readingSources) sourcesText += buffer;
        else streamedText += buffer;
      }

      // Parse
      try {
        if (sourcesText.trim()) setSources(JSON.parse(sourcesText.trim()));
      } catch (e) {
        console.error("Sources parse failed:", sourcesText);
      }

      try {
        if (debugText.trim()) setDebugData(JSON.parse(debugText.trim()));
      } catch (e) {
        console.error("Debug parse failed:", debugText);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchdocuments = async () => {
    const res = await fetch("http://127.0.0.1:8000/documents");
    const data = await res.json();
    setDocuments(data.documents);
  };

  useEffect(() => {
    fetchdocuments();
  }, []);

  const uploadFile = async (file: File) => {
    if (documents.length > 2) {
      alert("Maximum 2 documents  supported");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    fetchdocuments();
  };

  const removeDocument = async (name: string) => {
    await fetch(`http://127.0.0.1:8000/document/${name}`, { method: "DELETE" });
    fetchdocuments();
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4">
      {/* Knowledge Base Panel */}
      <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
              Knowledge Base
            </h3>
          </div>
          <span className="text-xs text-zinc-600 font-mono">
            {documents.length}/2 docs
          </span>
        </div>

        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full"
              >
                <span className="text-xs text-zinc-200 font-mono truncate max-w-[200px]">
                  📄 {doc}
                </span>
                <button
                  onClick={() => removeDocument(doc)}
                  className="text-zinc-600 hover:text-rose-400 transition-colors text-xs ml-1 leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && !uploading && (
          <p className="text-xs text-zinc-600 mb-3 italic">
            No documents uploaded yet.
          </p>
        )}

        {documents.length < 2 && (
          <label className="cursor-pointer w-fit block">
            <div className="flex items-center gap-2 border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 transition-all rounded-xl px-4 py-2">
              <span className="text-zinc-400 hover:text-zinc-200 text-xs font-medium">
                + Upload PDF or TXT
              </span>
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadFile(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
          </label>
        )}

        {documents.length >= 2 && (
          <p className="text-xs text-amber-500/70 font-mono">
            ⚠ Document limit reached
          </p>
        )}

        {uploading && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <p className="text-xs text-zinc-400">Uploading & indexing…</p>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        {/* Titlebar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/50 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs tracking-widest uppercase text-zinc-500 font-semibold ml-1">
            RAG Assistant
          </span>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="h-[440px] overflow-y-auto px-5 py-5 flex flex-col gap-1 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
                🧠
              </div>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                Upload your documents and ask anything. I'll retrieve the most
                relevant context.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 px-1 py-2">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-zinc-500 italic">Thinking…</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-3 border-t border-zinc-800 bg-zinc-900/30 shrink-0">
          <div className="flex gap-3 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something about your documents…"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-zinc-500 text-zinc-100 placeholder-zinc-600 text-sm rounded-xl px-4 py-3 outline-none transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              Send ↑
            </button>
          </div>
        </div>

        {/* Sources & Debug */}
        {(sources.length > 0 || debugData) && (
          <div className="px-5 pb-5 flex flex-col gap-4 border-t border-zinc-800/60 pt-4 bg-zinc-950">
            <SourceDocs docs={sources} />
            <DebugPanel data={debugData} />
          </div>
        )}
      </div>
    </div>
  );
}
