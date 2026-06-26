import type { NextRequest } from "next/server";
import type { ChatRequest } from "@/src/types";

/**
 * Proxy entre le chatbot (front) et le workflow n8n AI Agent.
 *
 * Contrat avec n8n : on envoie { session_id, prompt }. n8n garde la mémoire
 * de conversation par session_id ; on ne transmet donc que le dernier message.
 * L'URL et la clé n8n restent côté serveur — jamais exposées au navigateur.
 */
export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json(
      { reply: "Configuration manquante : N8N_WEBHOOK_URL n'est pas défini." },
      { status: 500 },
    );
  }

  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ reply: "Requête invalide." }, { status: 400 });
  }

  const prompt = body?.prompt?.trim();
  if (!prompt) {
    return Response.json({ reply: "Aucun message fourni." }, { status: 400 });
  }
  const sessionId = body.sessionId || crypto.randomUUID();

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.N8N_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.N8N_API_KEY}`;
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ chatInput: prompt, sessionId }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return Response.json(
        { reply: `[DEBUG ${res.status}] ${errBody || "pas de corps"}` },
        { status: 502 },
      );
    }

    const data = await res.json().catch(() => null);
    return Response.json({ reply: extraireReply(data) });
  } catch {
    return Response.json(
      { reply: "Impossible de joindre l'agent. Réessayez plus tard." },
      { status: 502 },
    );
  }
}

/**
 * Extrait le texte de réponse de façon tolérante : n8n peut renvoyer une
 * chaîne, un objet { reply | output | response | text | ... }, ou un tableau
 * d'items (format "Respond to Webhook"). On cherche le premier champ texte.
 */
function extraireReply(data: unknown): string {
  if (typeof data === "string" && data.trim()) return data;

  if (Array.isArray(data)) {
    for (const item of data) {
      const r = extraireReply(item);
      if (r && !r.startsWith("Désolé")) return r;
    }
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // n8n encapsule parfois la donnée dans { json: {...} }
    if (obj.json) return extraireReply(obj.json);
    for (const cle of [
      "reply",
      "output",
      "response",
      "text",
      "message",
      "answer",
    ]) {
      const v = obj[cle];
      if (typeof v === "string" && v.trim()) return v;
    }
  }

  return "Désolé, je n'ai pas pu interpréter la réponse de l'agent.";
}
