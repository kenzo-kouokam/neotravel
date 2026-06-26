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
  // Identifiant stable de la conversation — n8n garde sa mémoire dessus.
  const sessionIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  );

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
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          prompt: texte,
        }),
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
    <div className="flex h-[34rem] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-[color:var(--brand-ember)]/15 bg-white shadow-[0_20px_60px_-15px_rgba(180,83,9,0.25)]">
      <header className="flex items-center gap-3 border-b border-[color:var(--brand-ember)]/10 bg-gradient-to-r from-[color:var(--brand-sand)] to-white px-4 py-3.5">
        <div className="cta-sunset flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4.5 w-4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[color:var(--brand-clay)]">
            Assistant Neotravel
          </p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En ligne · répond en quelques secondes
          </p>
        </div>
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
                  ? "cta-sunset max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm leading-relaxed text-white shadow-sm"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-[color:var(--brand-sand)] px-3.5 py-2 text-sm leading-relaxed text-[color:var(--brand-clay)]"
              }
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[color:var(--brand-sand)] px-3.5 py-2.5 text-[color:var(--brand-clay)]">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--brand-ember)] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--brand-ember)] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--brand-ember)]" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-[color:var(--brand-ember)]/10 bg-white px-3 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ex. Lyon → Barcelone, 45 personnes, le 14 juillet…"
          className="flex-1 rounded-full border border-[color:var(--brand-ember)]/20 bg-[color:var(--brand-sand)]/40 px-4 py-2.5 text-sm text-[color:var(--brand-clay)] placeholder:text-zinc-400 outline-none transition-colors focus:border-[color:var(--brand-ember)]/50 focus:bg-white"
        />
        <button
          onClick={envoyer}
          disabled={loading || !input.trim()}
          aria-label="Envoyer"
          className="cta-sunset flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
