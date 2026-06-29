# Workflows n8n — NeoTravel

Export des workflows n8n qui pilotent l'automatisation commerciale (Option A : n8n + Airtable).

## 1. `1_Agent_Qualification.json` — Agent de qualification (chat)

Déclenché par le **Chat Trigger** (webhook public appelé par le front Next.js).

```
When chat message received → Search records (Parametres_Globaux)
  → AI Agent (Vercel AI Gateway + Simple Memory)
      └─ outil "Valider_Demande" → appelle le workflow 2
  → Respond to Webhook
```

- L'agent qualifie la demande (8 champs obligatoires), normalise les lieux, **ne calcule jamais de prix**.
- À complétion, il classe en `Nouveau` ou `Humain` (HITL : Urgence / International / Hors-Capacite) et déclenche `Valider_Demande`.
- `session_id` = `sessionId` du Chat Trigger (mémoire de conversation + clé d'idempotence).

## 2. `2_Remplissage_Tables.json` — Remplissage Airtable + calcul devis

Déclenché par le workflow 1 (`Execute Workflow`).

```
When Executed by Another Workflow
  → Search records (idempotence sur Cle_Idempotence)
  → If (déjà existant ? → No-Op : sinon)
      → Geocoding_Depart / Geocoding_Arrivee (api-adresse.data.gouv.fr)
      → Merge → Calcul_Distane_Metre (OSRM)
      → Rec_Schema_Demande (crée la Demande)
      → Rec_Logs_Observabilite (log tokens/coût/durée)
      → Aiguillage_Statut
          └─ si "Nouveau" : Parametres_Globaux → Matrices → Forfaits_KM
              → Code in JavaScript (calculer_devis déterministe)
              → Rec_Devis (crée le Devis)
              → Update_Statut_Demandes (Statut = Devis_Ok)
```

Le nœud **Code in JavaScript** est le moteur de tarification déterministe (forfait/km, coefficients
saison/anticipation/capacité additifs, marge nette, TVA). Sa logique est mirrorée en TypeScript dans
[`src/tools/calculer-devis.ts`](../src/tools/calculer-devis.ts).

> Base Airtable : `appqJ7LO7TyFkLQ6h` (NeoTravel V2 - Option A).
> Les `credentials` référencés sont des **identifiants internes n8n**, pas des secrets.
