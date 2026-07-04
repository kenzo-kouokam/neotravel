# 🚌 NeoTravel — Automatisation IA du Cycle Commercial

<div align="center">

[![Live Demo](https://img.shields.io/badge/Demo-Live-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](https://neotravel-projet.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![n8n](https://img.shields.io/badge/n8n-AI_Agent-EA4B71?style=for-the-badge&logo=n8n)](https://n8n.io/)
[![Airtable](https://img.shields.io/badge/Airtable-CRM-18BFFF?style=for-the-badge&logo=airtable&logoColor=white)](https://airtable.com/)
[![Epitech](https://img.shields.io/badge/Epitech-MBA1_2026-0f0f13?style=for-the-badge)](https://www.epitech.eu/)

**De la demande prospect au devis PDF — sans intervention humaine sur 80 % des cas.**

[🌐 Voir la démo live](https://neotravel-projet.vercel.app/) · [📄 Dossier de cadrage](docs/architecture.md) · [🔁 Workflows n8n](n8n/README.md)

</div>

---

## 🎯 Contexte & Problème

NeoTravel est une PME spécialisée dans le **transport de personnes en groupe** (autocars — particuliers, associations, entreprises). Son modèle : intermédiation entre clients et réseau d'autocaristes partenaires.

**Le problème :** ~60 leads/jour arrivent, le traitement est **100 % manuel** — qualification, calcul de devis à la main, envoi par email, relances oubliées. Résultat : leads payants perdus, délais de réponse > 24h, pipeline invisible, campagnes Ads bridées volontairement.

> *"Le problème n'est pas l'acquisition — c'est la sous-exploitation du flux existant."*

### Frictions identifiées (score /20)

| Problème | Score | Priorité |
|---|---|---|
| Leads non traités (sélectivité commerciale) | 16/20 | P1 |
| Campagnes Ads bridées | 15/20 | P1 |
| Délai de réponse élevé post-demande | 15/20 | P1 |
| Relances manuelles et irrégulières | 10/20 | P2 |
| Manque de visibilité pipeline / direction | 9/20 | P2 |

---

## 💡 La Solution

Une chaîne **automatisée de bout en bout**, construite en une semaine (MVP) :

1. **Chatbot conversationnel** — qualify la demande en 8 champs, naturallement.
2. **Moteur de devis déterministe** — `calculer_devis()` : le prix ne transite **jamais** par le LLM.
3. **Génération PDF automatique** + envoi email instantané (< 5 min après la demande).
4. **CRM automatique** Airtable — fiche créée, statut mis à jour, pipeline en temps réel.
5. **Relances planifiées** J+2 / J+3 / J+7 — aucune intervention commerciale sur les cas standard.
6. **Escalade HITL** — cas complexes (urgence, international, > capacité) redirigés vers un commercial avec contexte enrichi.

**Vision To-Be :** Un prospect exprime sa demande → le système qualifie, calcule, génère le devis PDF et l'envoie en moins de 5 minutes — sans intervention humaine pour les cas standards.

---

## 🏗 Architecture

```
                    ┌────────────────────────────────┐
   Prospect         │   Frontend — Next.js / Vercel   │
      │             │   Landing page + Chatbot IA      │
      └────────────▶│   Espace commercial (HITL)       │
                    └──────────────┬─────────────────-─┘
                                   │ POST /api/chat (webhook)
                                   ▼
                    ┌────────────────────────────────┐
                    │   n8n — Workflow 1              │
                    │   AI Agent de qualification     │
                    │   Collecte 8 champs · Classe    │
                    │   (Standard / Humain)           │
                    └──────────────┬─────────────────┘
                                   │ Execute Workflow
                                   ▼
                    ┌────────────────────────────────┐
                    │   n8n — Workflow 2              │
                    │   Géocodage (api-adresse.gouv)  │
                    │   Distance réelle (OSRM)        │
                    │   calculer_devis() ← déterministe
                    │   Écriture Airtable             │
                    └──────────────┬─────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   n8n — Workflow 3               │
                    │   Génération PDF + Envoi email   │
                    │   (Gmail SMTP + Nodemailer)      │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   n8n — Workflow 4               │
                    │   Relances automatiques          │
                    │   J+2 urgent / J+3 / J+7        │
                    └──────────────┬──────────────────┘
                                   ▼
                    ┌────────────────────────────────┐
                    │   Airtable (7 tables)           │
                    │   Demandes · Devis · Relances   │
                    │   Matrices · Forfaits · Logs    │
                    └──────────────┬─────────────────┘
                                   ▼
                    ┌────────────────────────────────┐
                    │   Dashboards Airtable Interface │
                    │   Cockpit commercial + Direction│
                    └────────────────────────────────┘
```

> **Règle d'or : L'agent décide — les outils exécutent.**
> `calculer_devis()` est toujours du **code déterministe**, jamais le LLM. Le prix est reproductible et auditable.

---

## 🧰 Stack Technique

| Couche | Outil | Rôle |
|---|---|---|
| **Frontend** | Next.js 16 + Tailwind v4 | Landing page + Chatbot + Espace commercial |
| **Déploiement** | **Vercel** | Hébergement frontend (gratuit) |
| **Agent IA** | n8n AI Agent | **GPT-4o-mini (OpenAI)** — temp. 0.1–0.2 extraction, 0.5–0.7 relances |
| **Orchestration** | **n8n Cloud** | 4 workflows (qualification → calcul → PDF → relances) |
| **Données / CRM** | **Airtable** | Base `NeoTravel V2` — 7 tables liées |
| **Calcul devis** | `calculer_devis()` | Moteur JS déterministe — jamais le LLM |
| **Géocodage** | api-adresse.data.gouv.fr | Coordonnées GPS des villes |
| **Distance** | OSRM | Distance routière réelle (km) |
| **Email** | **Gmail SMTP + Nodemailer** | 4 templates HTML (devis, relance×2, cas complexe) |
| **Tests** | Vitest | Golden set du moteur de tarification |
| **Budget total** | — | **25–35 €/mois** (n8n Starter 20 € + GPT-4o-mini ~10 €) |

---

## 🔁 Les 4 Workflows n8n

Les exports JSON sont versionnés dans [`n8n/`](n8n/) et importables directement dans n8n.

### Workflow 1 — Agent de qualification
- Déclenché par **Chat Trigger** (webhook Next.js → n8n)
- Collecte **8 champs obligatoires** de façon conversationnelle
- Classifie : `Standard` (→ Workflow 2) ou `Humain` (urgence / international / hors-capacité → escalade HITL)
- Ne calcule **jamais de prix** — séparation stricte des responsabilités

### Workflow 2 — Géocodage + Calcul + CRM
- Géocode les villes (api-adresse.data.gouv.fr), calcule la distance OSRM
- Appelle `calculer_devis()` — moteur 100 % déterministe
- Crée la fiche **Demandes** + **Devis** dans Airtable
- Log observabilité (tokens, coût IA, latence)

### Workflow 3 — PDF + Email
- Génère le devis formaté en **PDF**
- Envoie l'email au prospect via Gmail SMTP + Nodemailer
- Met à jour le statut dans le CRM

### Workflow 4 — Relances automatiques
- Schedule Trigger : J+2 (urgent) / J+3 / J+7
- Clé d'idempotence — un devis ne peut pas être relancé deux fois
- Mise à jour automatique des statuts

---

## 🧮 Moteur de Devis Déterministe

Cœur de fiabilité du projet. Implémenté **deux fois à l'identique** :
- En production : nœud `Code in JavaScript` du Workflow 2
- Dans le repo (référence + tests) : [`src/tools/calculer-devis.ts`](src/tools/calculer-devis.ts)

### Étapes de calcul

1. **Distance facturée** = distance OSRM (km) × 2 si Aller-Retour
2. **Transport sec** : forfait grille si ≤ 180 km, sinon × 5 €/km
3. **Options** : nuités chauffeur + guide si demandés
4. **Coefficients additifs** (Matrices Airtable) : Saison + Anticipation + Capacité → `sous-total × (1 + Σ coef)`
5. **Marge nette** : `HT = coût / (1 − 15 %)`
6. **TVA** : `TTC = HT × 1,10`

> Toutes les valeurs (grille, coefficients, seuils, TVA) viennent d'Airtable — **rien n'est codé en dur**.

---

## 🗂 Modèle de Données Airtable

7 tables liées dans la base `NeoTravel V2 - Option A` :

| Table | Rôle |
|---|---|
| **Demandes_Schema** | Fiche prospect : statut, trajet, dates, distance, pax, urgence |
| **Devis_Schema** | Devis calculé : HT brut, coefficients, marge, TVA, TTC |
| **Relances_Schema** | Relances J+2/J+3/J+7 avec clé d'idempotence |
| **Logs_Observabilite** | Observabilité IA : tokens, coût, latence par demande |
| **Parametres_Globaux** | Seuils, marge, TVA, prix km/nuit/guide |
| **Matrices** | Coefficients saison / anticipation / capacité |
| **Forfaits_KM** | Grille tarifaire par palier de distance |

**Cycle de vie :** `Nouveau → Devis_Ok → Relance_1/2/3 → Accepté / Refusé → Clôture`
(Branche escalade : `Humain` → traité par commercial avec contexte enrichi)

---

## 📊 Dashboards

### Cockpit Commercial *(équipe de vente)*
- Pipeline par statut, file d'escalade (Humain / Urgences)
- Détail des devis : CA, marge, panier moyen

### Performance Business *(direction)*
- CA gagné, taux de conversion, répartition pipeline
- Coût IA total / par devis, latence, volume de traitements

**KPIs cibles :**

| KPI | Cible |
|---|---|
| Taux de leads traités | 100 % (vs ~70 % avant) |
| Délai demande → devis | < 5 minutes |
| Leads payants non recontactés | 0 |
| Coût IA par devis | < 0,01 € |
| Fiabilité `calculer_devis()` | 100 % sur golden set |

---

## 📁 Structure du Repo

```
├── app/
│   ├── api/chat/route.ts         → proxy serveur Next.js → n8n
│   ├── api/devis/route.ts        → expose calculer_devis() en HTTP
│   ├── commercial/page.tsx       → espace HITL (Human-In-The-Loop)
│   ├── components/Chatbot.tsx    → widget chatbot landing
│   └── page.tsx                  → landing page
├── src/
│   ├── tools/calculer-devis.ts       → moteur déterministe (miroir TS du nœud n8n)
│   ├── tools/calculer-devis.test.ts  → golden set Vitest (12 scénarios)
│   ├── agent/prompt-systeme.md       → prompt système de l'agent IA
│   └── types/index.ts                → types TypeScript partagés
├── n8n/
│   ├── 1_Agent_Qualification.json    → workflow qualification conversationnelle
│   ├── 2_Remplissage_Tables.json     → géocodage + calcul + Airtable
│   ├── 3_Envoi_Devis_PDF.json        → génération PDF + email
│   ├── 4_Relances.json               → relances J+2/J+3/J+7
│   └── README.md                     → guide d'import des workflows
└── docs/
    ├── architecture.md               → architecture détaillée
    ├── decisions.md                  → ADRs (Architecture Decision Records)
    ├── n8n-setup.md                  → guide de configuration n8n
    ├── airtable-export.md            → export schéma Airtable
    └── jeux-de-tests.md              → 12 scénarios de test chatbot
```

---

## 🚀 Lancement en Local

```bash
# Cloner le repo
git clone https://github.com/kenzo-kouokam/neotravel.git
cd neotravel

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# → Renseigner N8N_WEBHOOK_URL, AIRTABLE_API_KEY, AIRTABLE_BASE_ID

# Lancer le serveur de développement
npm run dev        # http://localhost:3000

# Autres commandes
npm run build      # Build de production
npm run test       # Golden set Vitest (moteur de devis)
npm run lint       # ESLint
```

---

## 🔐 Variables d'Environnement

Voir [`.env.example`](.env.example) pour la liste complète.

| Variable | Rôle |
|---|---|
| `N8N_WEBHOOK_URL` | URL webhook n8n (agent de qualification) |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app (Vercel) |
| `AIRTABLE_API_KEY` | Token d'accès Airtable (côté serveur uniquement) |
| `AIRTABLE_BASE_ID` | ID de la base NeoTravel V2 |

> ⚠️ Ne jamais committer `.env.local` — déjà dans `.gitignore`.

---

## 👥 Équipe — Groupe 7, MBA1 Epitech 2026

> ✅ Soutenance effectuée le 01/07/2026

| Personne | Membre | Périmètre |
|---|---|---|
| **P1** | Frontend | Next.js landing + chatbot + espace commercial |
| **P2** | n8n Agent | Workflows n8n AI Agent, tool calling, JSON |
| **P3** | Calcul devis | `calculer_devis()` déterministe + génération PDF |
| **P4** | Airtable | 7 tables, dashboard Interface direction |
| **P5 — Cedric Enzo Kouokam** | **Emails & Relances** | Templates HTML × 4, Nodemailer Gmail SMTP, scheduler relances J+3/J+7, idempotence anti-doublon |

---

## ⭐ Règle d'Or

> **L'agent IA décide — les outils exécutent.**
>
> `calculer_devis()` est **toujours du code, jamais du LLM**.
>
> Le prix est **reproductible et auditable** : pour les mêmes entrées, le moteur renvoie
> exactement le même devis, indépendamment du modèle d'IA utilisé pour la conversation.

---

<div align="center">
<sub>NeoTravel Automation · Projet MBA1 Epitech · Groupe 7 · Juin 2026</sub><br>
<sub><a href="https://neotravel-projet.vercel.app/">🌐 Demo live</a> · <a href="https://github.com/kenzo-kouokam">👤 kenzo-kouokam</a></sub>
</div>
