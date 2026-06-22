# Neotravel — Automatisation du Processus Commercial

> Projet étudiant — Automatisation du cycle commercial d'une PME de transport de groupe.

## Stack

**Option choisie** : [A — n8n au cœur] ou [B — Vercel AI SDK]  
**Justification** : [à compléter après décision d'équipe]

| Brique | Outil |
|---|---|
| Front | Next.js + Tailwind — déployé sur Vercel |
| Agent IA | [n8n AI Agent / Vercel AI SDK] |
| Données | [Airtable / Supabase] |
| Calcul devis | `calculer_devis()` — déterministe, jamais le LLM |
| Emails | [Resend / Brevo] |
| Relances | n8n Schedule Trigger |
| PDF | [à définir] |

## Lancement en local

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
git clone https://github.com/TON_USERNAME/neotravel-automation.git
cd neotravel-automation
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

L'application est disponible sur `http://localhost:3000`

## Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.  
**Ne jamais committer `.env.local`.**

## Architecture

npm run dev
```

L'application est disponible sur `http://localhost:3000`

## Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.  
**Ne jamais committer `.env.local`.**

## Architecture
Voir `docs/architecture.md` pour le schéma détaillé.

## Structure du projet
## Tests

```bash
npm run test
```

## Équipe

| Membre | Rôle | Responsabilité |
|---|---|---|
| [Prénom A] | PM / Analyste | L1, matrices, coordination, slides |
| [Prénom B] | Dev backend | calculer_devis(), agent, tests |
| [Prénom C] | Dev front / Intégrations | Next.js, n8n relances, déploiement |

## Règle d'or

> L'agent IA décide — les outils exécutent.  
> `calculer_devis()` est toujours du code déterministe, jamais le LLM.

## Liens

- [Board Agile Notion](lien_à_ajouter)
- [Déploiement Vercel](lien_à_ajouter)
- [Instance n8n](lien_à_ajouter)
