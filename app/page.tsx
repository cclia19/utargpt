"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  citations?: string[];
};

export default function HomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hello, I’m UTARGPT. Ask me anything about UTAR.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .slice(0, -1)
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          history,
        }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        role: "assistant",
        text: data.text || "No response received.",
        citations: data.citations || [],
        };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong while contacting the server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">UTARGPT</h1>
        <p className="text-gray-600 mb-6">
          Your AI assistant for UTAR information
        </p>

        <div className="flex-1 border rounded-2xl p-4 bg-gray-50 overflow-y-auto min-h-[500px] space-y-4">
          {messages.map((msg, index) => (
            <div
  key={index}
  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
    msg.role === "user"
      ? "ml-auto bg-black text-white"
      : "mr-auto bg-white border text-black"
  }`}
>
  {msg.role === "user" ? (
    <div className="whitespace-pre-wrap">{msg.text}</div>
  ) : (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc pl-5 space-y-1" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal pl-5 space-y-1" />
          ),
          p: ({ ...props }) => <p {...props} className="mb-2 last:mb-0" />,
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold" />
          ),
        }}
      >
        {msg.text}
      </ReactMarkdown>

      {msg.citations && msg.citations.length > 0 && (
        <div className="pt-2 border-t text-sm text-gray-600">
          <div className="font-medium mb-1">Sources</div>
          <ul className="list-disc pl-5 space-y-1">
            {msg.citations.map((citation, i) => (
              <li key={i}>{citation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}
</div>

          {loading && (
            <div className="mr-auto bg-white border text-black max-w-[80%] px-4 py-3 rounded-2xl">
              Thinking...
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask UTARGPT something..."
            className="flex-1 border rounded-xl px-4 py-3 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}