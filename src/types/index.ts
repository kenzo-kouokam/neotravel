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

/**
 * Corps de la requête envoyée au proxy /api/chat puis à n8n.
 * Contrat aligné sur le workflow n8n : { session_id, prompt }.
 */
export interface ChatRequest {
  /** Identifiant stable de la conversation — n8n garde sa mémoire dessus. */
  sessionId: string;
  /** Dernier message de l'utilisateur. */
  prompt: string;
}

/** Réponse de l'agent renvoyée au client. */
export interface ChatResponse {
  reply: string;
  /** Lead mis à jour par l'agent (champs détectés). */
  lead?: Lead;
  /** Champs encore manquants pour calculer un devis. */
  champsManquants?: (keyof Lead)[];
}
