"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

const suggestions = [
  "Summarize today's work progress",
  "Who hasn't submitted a report?",
  "Show blocked tasks",
  "Which projects are at risk?",
];

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function AdminChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");

    if (companyId) {
      setUserId(companyId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const content = text.trim();

    if (!content || loading) return;

    if (!userId) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content:
            "Unable to identify your organization. Please log in again and try again.",
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          message: content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get a response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer || "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-white">
            KARYA AI Assistant
          </h1>
          <p className="text-xs text-gray-400">
            Ask about work progress, reports, projects and your team.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <Sparkles className="mb-4 h-8 w-8 text-indigo-400" />

            <h2 className="text-xl font-semibold text-white">
              How can I help you today?
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">
              Ask questions about your team's work, employee reports, project
              progress, or pending tasks.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap wrap-break-word text-sm leading-7 ${
                  message.role === "user"
                    ? "rounded-2xl rounded-br-md bg-indigo-500 px-4 py-2.5 text-white"
                    : "text-gray-200"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="h-4 w-4 animate-pulse text-indigo-400" />
            <span>KARYA AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={loading || !userId}
              className="rounded-full border border-white/10 bg-[#101116] px-3 py-1.5 text-xs text-gray-300 transition hover:border-indigo-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2 rounded-xl border border-white/10 bg-[#101116] px-3 py-2.5 focus-within:border-indigo-400/50"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about progress, reports or projects..."
            rows={1}
            disabled={loading || !userId}
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || loading || !userId}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-2 text-center text-[11px] text-gray-500">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}