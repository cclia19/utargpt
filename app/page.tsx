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
      citations: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const history = updatedMessages
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
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">UTARGPT</h1>
          <p className="mt-2 text-gray-600">
            Your AI assistant for UTAR information
          </p>
        </div>

        <div className="flex-1 space-y-4 rounded-2xl border bg-gray-50 p-4 min-h-[520px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 break-words ${
                msg.role === "user"
                  ? "ml-auto bg-black text-white"
                  : "mr-auto border bg-white text-black"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="space-y-3">
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
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
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="border-t pt-3 text-sm text-gray-600">
                      <div className="mb-1 font-medium">Sources</div>
                      <ul className="list-disc space-y-1 pl-5">
                        {msg.citations.map((citation, i) => (
                          <li key={i}>{citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto max-w-[85%] rounded-2xl border bg-white px-4 py-3 text-black">
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
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask UTARGPT something..."
            className="flex-1 rounded-xl border px-4 py-3 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}