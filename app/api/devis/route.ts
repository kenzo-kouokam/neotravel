import type { NextRequest } from "next/server";
import { calculerDevis, type ParamsDevis } from "@/src/tools/calculer-devis";

/**
 * Route HTTP exposant calculer_devis() comme outil pour n8n.
 *
 * L'agent IA (n8n) appelle cette route via un nœud HTTP Request quand il a
 * collecté tous les champs requis. Le calcul reste 100 % déterministe — aucun
 * appel au LLM ne transite par ici.
 *
 * Contrat — corps attendu (JSON) :
 *   {
 *     nb_passagers: number,
 *     date_depart: string (ISO),
 *     date_demande?: string (ISO),
 *     distance_km: number,
 *     type_trajet?: "simple" | "aller_retour",
 *     options?: [{ type, quantite?, montant? }]
 *   }
 *
 * Réponses :
 *   200 → { prix_ht, tva, prix_ttc, lignes, coefficients, devise }
 *   400 → { error: string } (paramètres invalides — cas limites du PDF)
 */
export async function POST(request: NextRequest) {
  let body: ParamsDevis;
  try {
    body = (await request.json()) as ParamsDevis;
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  try {
    const resultat = calculerDevis(body);
    return Response.json(resultat);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de calcul.";
    return Response.json({ error: message }, { status: 400 });
  }
}
