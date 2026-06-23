"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, ChatResponse } from "@/src/types";

const MESSAGE_ACCUEIL: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour 👋 Je suis l'assistant Neotravel. Dites-moi votre projet de déplacement en groupe et je vous prépare un devis.",
};

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([MESSAGE_ACCUEIL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function envoyer() {
    const texte = input.trim();
    if (!texte || loading) return;

    const userMessage: ChatMessage = { role: "user", content: texte };
    const historique = [...messages, userMessage];
    setMessages(historique);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historique }),
      });
      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Réessayez.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  return (
    <div className="flex h-[32rem] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/15 dark:bg-zinc-900">
      <header className="border-b border-black/10 px-4 py-3 dark:border-white/15">
        <p className="text-sm font-semibold text-black dark:text-zinc-50">
          Assistant Neotravel
        </p>
        <p className="text-xs text-zinc-500">Devis transport de groupe</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            <span
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-black px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-400 dark:bg-zinc-800">
              …
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-black/10 px-3 py-3 dark:border-white/15">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Votre message…"
          className="flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
        <button
          onClick={envoyer}
          disabled={loading || !input.trim()}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
