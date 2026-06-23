# Guide n8n — Backend Agent IA (Jour 2)

Ce guide explique comment construire le workflow n8n qui alimente le chatbot du
site. Le front (Next.js) est déjà prêt : il envoie chaque conversation à n8n et
affiche la réponse. **Il n'y a aucun code Next.js à modifier.**

---

## 1. Vue d'ensemble

```
Navigateur → /api/chat (Next.js, déjà fait)
           → Webhook n8n  ← TON TRAVAIL
           → AI Agent (LLM + prompt système + tool calculer_devis)
           → Réponse JSON → retour au front
```

Le proxy Next.js (`app/api/chat/route.ts`) :
- appelle l'URL définie dans `N8N_WEBHOOK_URL`,
- ajoute l'en-tête `Authorization: Bearer <N8N_API_KEY>` **si** la variable est
  définie (optionnel),
- transmet le corps tel quel.

---

## 2. Le contrat d'échange (à respecter absolument)

### Ce que n8n REÇOIT (corps de la requête POST)

```json
{
  "messages": [
    { "role": "assistant", "content": "Bonjour 👋 ..." },
    { "role": "user", "content": "Je veux aller de Lyon à Barcelone..." }
  ],
  "lead": {}
}
```

- `messages` : tout l'historique de la conversation, dans l'ordre.
- `lead` : objet partiel (peut être vide au début).

### Ce que n8n DOIT RENVOYER (réponse JSON)

```json
{
  "reply": "Très bien ! Pour combien de personnes ?",
  "lead": {
    "depart": "Lyon",
    "destination": "Barcelone",
    "dateDepart": "2026-07-14"
  },
  "champsManquants": ["nbPassagers"]
}
```

- `reply` : **obligatoire** — le texte affiché dans la bulle du chatbot.
- `lead` : optionnel — les champs détectés (voir `src/types/index.ts`).
- `champsManquants` : optionnel — les champs requis encore manquants.

> ⚠️ Si la structure de la réponse ne contient pas `reply`, le front affichera
> du vide. Le champ `reply` est le minimum vital.

Les champs du lead sont définis dans
[`src/types/index.ts`](../src/types/index.ts) :
`nom, email, telephone, depart, destination, dateDepart, dateRetour, nbPassagers`.
Champs **obligatoires** pour un devis : `depart, destination, dateDepart, nbPassagers`.

---

## 3. Construction du workflow dans n8n

1. **Créer une instance n8n**
   - Option simple : [n8n Cloud](https://n8n.io) (essai gratuit).
   - Option self-hosted : `npx n8n` ou Docker.

2. **Node 1 — Webhook**
   - Type : `Webhook`
   - Méthode : `POST`
   - Path : ex. `neotravel-chat`
   - Mode de réponse : **"Using Respond to Webhook node"** (pour pouvoir
     renvoyer un JSON construit à la fin).
   - L'URL de production de ce webhook → à coller dans `.env.local` :
     ```
     N8N_WEBHOOK_URL=https://<ton-instance>.app.n8n.cloud/webhook/neotravel-chat
     ```

3. **Node 2 — AI Agent**
   - Type : `AI Agent` (LangChain).
   - **System Message** : copier-coller le contenu de
     [`src/agent/prompt-systeme.md`](../src/agent/prompt-systeme.md).
   - **Chat Model** : connecter un modèle (OpenAI, Anthropic…). La clé va dans
     les *Credentials* n8n, pas dans le repo.
   - **Input** : mapper l'historique `messages` reçu du webhook.

4. **Node 3 — Tool `calculer_devis`** (peut être branché plus tard, Jour 3)
   - L'agent ne calcule JAMAIS le prix lui-même.
   - Option A : node *Code* qui réimplémente la logique de
     `src/tools/calculer-devis.ts`.
   - Option B : un node *HTTP Request* qui appelle une route Next.js
     `/api/devis` (à créer Jour 3) exposant `calculer_devis()`.
   - Recommandé : Option B, pour garder une seule source de vérité du calcul.

5. **Node 4 — Respond to Webhook**
   - Construire le JSON de réponse au format du contrat ci-dessus
     (`reply`, `lead`, `champsManquants`).

---

## 4. Sécurité

- Mettre une clé dans le webhook (Header Auth) et la reporter dans
  `N8N_API_KEY` (`.env.local`). Le proxy l'enverra automatiquement.
- Ne jamais committer les credentials n8n ni `.env.local`.

---

## 5. Test de bout en bout

1. Renseigner `N8N_WEBHOOK_URL` (et `N8N_API_KEY`) dans `.env.local`.
2. Relancer `npm run dev`.
3. Ouvrir http://localhost:3000 et écrire un message dans le chatbot.
4. Vérifier dans n8n que l'exécution se déclenche et renvoie un `reply`.

Tant que le webhook n'est pas configuré, le chatbot affiche
« Impossible de joindre l'agent » — c'est le comportement normal.
