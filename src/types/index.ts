// Types TypeScript partagés — Neotravel

/** Un message échangé dans le chatbot. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Champs d'un lead captés par l'agent lors de la qualification. */
export interface Lead {
  nom?: string;
  email?: string;
  telephone?: string;
  /** Ville ou point de départ du groupe. */
  depart?: string;
  /** Destination souhaitée. */
  destination?: string;
  /** Date de départ (ISO 8601). */
  dateDepart?: string;
  /** Date de retour (ISO 8601), si aller-retour. */
  dateRetour?: string;
  /** Nombre de passagers. */
  nbPassagers?: number;
}

/** Champs obligatoires pour pouvoir calculer un devis. */
export const CHAMPS_REQUIS: (keyof Lead)[] = [
  "depart",
  "destination",
  "dateDepart",
  "nbPassagers",
];

/** Corps de la requête envoyée à l'agent (proxy vers n8n). */
export interface ChatRequest {
  messages: ChatMessage[];
  /** Lead partiel reconstruit côté client au fil de la conversation. */
  lead?: Lead;
}

/** Réponse de l'agent renvoyée au client. */
export interface ChatResponse {
  reply: string;
  /** Lead mis à jour par l'agent (champs détectés). */
  lead?: Lead;
  /** Champs encore manquants pour calculer un devis. */
  champsManquants?: (keyof Lead)[];
}
