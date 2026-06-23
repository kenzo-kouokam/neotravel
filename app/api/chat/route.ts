import type { NextRequest } from "next/server";
import type { ChatRequest, ChatResponse } from "@/src/types";

/**
 * Proxy entre le chatbot (front) et le workflow n8n AI Agent.
 *
 * Le front envoie l'historique de conversation ici ; on le transmet au webhook
 * n8n, qui exécute l'agent IA et renvoie la réponse. On garde l'URL et la clé
 * n8n côté serveur — elles ne sont jamais exposées au navigateur.
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

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { reply: "Aucun message fourni." },
      { status: 400 },
    );
  }

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
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return Response.json(
        { reply: "L'agent est momentanément indisponible. Réessayez." },
        { status: 502 },
      );
    }

    const data = (await res.json()) as ChatResponse;
    return Response.json(data);
  } catch {
    return Response.json(
      { reply: "Impossible de joindre l'agent. Réessayez plus tard." },
      { status: 502 },
    );
  }
}
