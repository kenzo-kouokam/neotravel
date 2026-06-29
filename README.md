# 🚌 NeoTravel — Automatisation du Processus Commercial

> Projet EPITECH MBA1 — Automatisation du cycle commercial d'une PME de transport de groupe.
> De la demande client (chat) jusqu'au devis tarifé, avec intervention humaine sur les cas complexes.

---

## 📑 Sommaire

- [Le problème](#-le-problème)
- [La solution](#-la-solution)
- [Architecture générale](#-architecture-générale)
- [Stack technique](#-stack-technique)
- [Les workflows n8n](#-les-workflows-n8n)
- [Le moteur de devis déterministe](#-le-moteur-de-devis-déterministe)
- [Modèle de données Airtable](#-modèle-de-données-airtable)
- [Les dashboards](#-les-dashboards)
- [Structure du repo](#-structure-du-repo)
- [Lancement en local](#-lancement-en-local)
- [Variables d'environnement](#-variables-denvironnement)
- [Équipe](#-équipe)
- [Règle d'or](#-règle-dor)

---

## 🎯 Le problème

NeoTravel reçoit des demandes de transport de groupe (autocars) par différents canaux. Le traitement est
**manuel, lent et non traçable** : un commercial qualifie la demande, calcule un prix à la main selon une
grille interne, rédige un devis, relance le client. Résultat : délais longs, erreurs de tarification, pas de
visibilité sur le pipeline.

## 💡 La solution

Une chaîne **automatisée de bout en bout** qui :

1. **Qualifie** la demande via un agent conversationnel (chatbot sur la landing page).
2. **Géolocalise et mesure** le trajet automatiquement (géocodage + routing).
3. **Calcule le devis** avec un moteur **100 % déterministe** (jamais le LLM — voir [Règle d'or](#-règle-dor)).
4. **Escalade vers un humain** (Human-In-The-Loop) les cas complexes : urgence, international, hors-capacité.
5. **Trace tout** dans Airtable et expose des **dashboards** décisionnels (commercial, business, coûts IA).

Le tout sans qu'un commercial n'intervienne sur les ~80 % de demandes standard.

---

## 🏗 Architecture générale

```
                              ┌─────────────────────────────┐
   Prospect                   │   Front Next.js (Vercel)     │
      │                       │   Landing + Chatbot          │
      │   message chat        │   Espace commercial /commercial
      └──────────────────────▶│                              │
                              └──────────────┬───────────────┘
                                             │ POST /api/chat  (proxy serveur)
                                             ▼
                              ┌─────────────────────────────┐
                              │   n8n — Workflow 1            │
                              │   Agent de qualification IA   │
                              │   (Chat Trigger → AI Agent)   │
                              └──────────────┬───────────────┘
                                             │ outil "Valider_Demande"
                                             ▼
                              ┌─────────────────────────────┐
                              │   n8n — Workflow 2            │
                              │   Géocodage + distance        │
                              │   + calcul devis déterministe │
                              │   + écritures Airtable        │
                              └──────────────┬───────────────┘
                                             ▼
                              ┌─────────────────────────────┐
                              │   Airtable (base de données)  │
                              │   Demandes / Devis / Logs…    │
                              └──────────────┬───────────────┘
                                             ▼
                              ┌─────────────────────────────┐
                              │   Dashboards Airtable         │
                              │   Cockpit Commercial          │
                              │   Performance Business        │
                              └─────────────────────────────┘
```

Le **calcul de prix ne transite jamais par le LLM** : l'agent qualifie et transmet des champs structurés,
un nœud de code déterministe calcule le tarif.

---

## 🧰 Stack technique

| Brique | Outil | Détail |
|---|---|---|
| **Front** | Next.js 16 + Tailwind v4 | App Router, déployé sur **Vercel** |
| **Agent IA** | n8n AI Agent | via **Vercel AI Gateway** (température 0) + mémoire de session |
| **Orchestration** | n8n Cloud | 2 workflows (qualification + remplissage/calcul) |
| **Données** | **Airtable** | base `NeoTravel V2 - Option A` |
| **Calcul devis** | `calculer_devis()` | code déterministe — **jamais le LLM** |
| **Géocodage** | api-adresse.data.gouv.fr | coordonnées des villes |
| **Distance** | OSRM (router.project-osrm.org) | distance routière réelle en mètres |
| **Tests** | Vitest | golden set du moteur de tarification |

> **Option retenue : A** (n8n + Airtable), parmi les deux options du brief.

---

## 🔁 Les workflows n8n

Les exports JSON sont versionnés dans [`n8n/`](n8n/) (voir [`n8n/README.md`](n8n/README.md)).

### Workflow 1 — `1_Agent_Qualification.json`

Déclenché par le **Chat Trigger** (webhook public appelé par le front via `/api/chat`).

```
When chat message received → Search records (Parametres_Globaux)
  → AI Agent (Vercel AI Gateway + Simple Memory)
       └─ outil "Valider_Demande" → déclenche le Workflow 2
  → Respond to Webhook
```

- Collecte **8 champs obligatoires** (identité, e-mail, téléphone, type de trajet, dates, passagers, lieux, guide).
- **Normalise** les lieux (« Lyion » → « Lyon ») et refuse les dates passées.
- **Ne calcule jamais de prix** (réponse standard : « Notre équipe calcule votre proposition… »).
- **Classe** la demande :
  - `Humain` si **Urgence** (départ imminent), **International** (hors France) ou **Hors-Capacité** (> seuil pax) ;
  - `Nouveau` si tous les critères sont standard.
- `session_id` = identifiant de conversation (mémoire + clé d'idempotence).

### Workflow 2 — `2_Remplissage_Tables.json`

Déclenché par le Workflow 1 (`Execute Workflow`).

```
When Executed by Another Workflow
  → Search records (idempotence sur Cle_Idempotence)
  → If (demande déjà existante ? → No-Op : sinon ↓)
      → Geocoding_Depart / Geocoding_Arrivee (api-adresse)
      → Merge → Calcul_Distane_Metre (OSRM)
      → Rec_Schema_Demande            (crée la Demande)
      → Rec_Logs_Observabilite        (log tokens / coût / durée)
      → Aiguillage_Statut
          └─ si "Nouveau" : Parametres_Globaux → Matrices → Forfaits_KM
              → Code in JavaScript     (← le moteur de devis)
              → Rec_Devis              (crée le Devis)
              → Update_Statut_Demandes (Statut → Devis_Ok)
```

---

## 🧮 Le moteur de devis déterministe

Cœur de fiabilité du projet. Implémenté **deux fois, à l'identique** :

- **En production** : nœud `Code in JavaScript` du Workflow 2.
- **Dans le repo (référence/tests)** : [`src/tools/calculer-devis.ts`](src/tools/calculer-devis.ts), testé par
  [`calculer-devis.test.ts`](src/tools/calculer-devis.test.ts).

Toutes les valeurs (grille, coefficients, seuils, marge, TVA) viennent d'**Airtable**, rien n'est codé en dur.

### Étapes de calcul

1. **Distance facturée** = distance routière (OSRM, en m → km) × 2 si Aller-Retour.
2. **Transport sec** :
   - distance ≤ `SEUIL_DIST_FORFAIT` (180 km) → **forfait** de la grille `Forfaits_KM` ;
   - sinon → distance × `PRIX_KM_HORS_FORFAIT` (5 €/km).
3. **Nuités chauffeur** = nb nuits × `PRIX_NUIT_CHAUFFEUR` ; **Guide** = nb jours × `PRIX_GUIDE_JOUR` (si demandé).
4. **Coefficients additifs** (table `Matrices`) : Saison + Anticipation + Capacité.
   `coût après coef = sous-total × (1 + Σ coefficients)`.
5. **Marge nette** : `HT = coût / (1 − MARGE_COMMERCIALE)` (15 %).
6. **TVA** : `TTC = HT × (1 + TVA_TRANSPORT)` (10 %).

> ⚠️ Spécificités : coefficients **additifs** (et non multiplicatifs), marge appliquée en **division** (marge nette),
> nuités/guide intégrés **avant** les coefficients. Le moteur TS reproduit exactement ces choix.

---

## 🗂 Modèle de données Airtable

Base `NeoTravel V2 - Option A` (`appqJ7LO7TyFkLQ6h`).

| Table | Rôle |
|---|---|
| **Demandes_Schema** | demandes clients (statut, escalade, trajet, dates, distance, pax…) |
| **Devis_Schema** | devis calculés (HT brut, coefficients, marge, TVA, TTC, validation humaine) |
| **Relances_Schema** | relances de suivi (J+2 / J+3 / J+7) |
| **Logs_Observabilite** | observabilité IA (tokens, coût d'inférence, durée d'exécution) |
| **Parametres_Globaux** | seuils, marge, TVA, prix km/nuit/guide |
| **Matrices** | coefficients saison / anticipation / capacité |
| **Forfaits_KM** | grille de tarification forfaitaire par palier de distance |

**Cycle de vie d'une demande** :
`Nouveau → Devis_Ok → (Relance_1/2/3) → Accepte / Refuse → Cloture`
— branche d'escalade : `Humain` (traité par un commercial).

Un export complet des données est disponible dans [`docs/airtable-export.md`](docs/airtable-export.md).

---

## 📊 Les dashboards

Construits avec les **Interfaces Airtable**, alimentés en temps réel par la base.

### Cockpit Commercial *(équipe de vente)*
- **Pilotage & escalade** : demandes totales, pipeline par statut, typologie, **% validation humaine**.
- **File d'escalade** : dossiers à traiter (onglets *Humain* / *Urgences* / tous).
- **Traitement devis** : CA, marge, TVA, panier moyen + détail des devis.

### Performance Business *(direction)*
- **CA & conversion** : CA gagné, taux de conversion, panier moyen, répartition du pipeline.
- **Performance IA & coûts** : volume de traitements, coût IA total/par devis, latence, tokens.

> Argument clé : **~80 %** des demandes traitées **sans intervention humaine**, pour un coût IA de quelques centimes.

---

## 📁 Structure du repo

```
app/
  api/chat/route.ts        → proxy serveur front → n8n ({ session_id, prompt })
  api/devis/route.ts       → expose calculer_devis() en HTTP (référence/tests)
  commercial/page.tsx      → espace commercial (Human-In-The-Loop)
  components/Chatbot.tsx    → widget de chat de la landing
  page.tsx                  → landing page
  globals.css / layout.tsx
src/
  tools/calculer-devis.ts       → moteur de devis déterministe (miroir TS du nœud n8n)
  tools/calculer-devis.test.ts  → golden set Vitest
  agent/prompt-systeme.md       → prompt système de l'agent
  data/leads-demo.ts            → données de démo de l'espace commercial
  types/index.ts                → types TypeScript partagés
n8n/
  1_Agent_Qualification.json    → workflow agent de qualification
  2_Remplissage_Tables.json     → workflow géocodage + calcul + Airtable
  README.md                     → explication des workflows
docs/
  architecture.md / decisions.md / n8n-setup.md / airtable-export.md
```

---

## 🚀 Lancement en local

```bash
git clone https://github.com/qaramunn/neotravel-automation.git
cd neotravel-automation
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev                  # http://localhost:3000
```

Autres commandes :

```bash
npm run build   # build de production
npm run test    # golden set du moteur de devis (Vitest)
npm run lint    # ESLint
```

---

## 🔐 Variables d'environnement

Voir [`.env.example`](.env.example) pour la liste complète. Principales :

| Variable | Rôle |
|---|---|
| `N8N_WEBHOOK_URL` | URL du webhook n8n (agent de qualification) |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app |
| `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` | accès Airtable (côté serveur) |

> ⚠️ **Ne jamais committer `.env.local`** (déjà gitignoré). Les clés restent côté serveur, jamais exposées au navigateur.

---

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Mohamed** | PM / Analyste |
| **Mathis** | Dev backend / n8n |
| **Omar** | Dev front / Intégrations |

---

## ⭐ Règle d'or

> **L'agent IA décide — les outils exécutent.**
> `calculer_devis()` est **toujours du code, jamais le LLM**.

C'est ce qui garantit un prix **reproductible et auditable** : pour les mêmes entrées, le moteur renvoie
toujours exactement le même devis, indépendamment du modèle d'IA utilisé pour la conversation.
