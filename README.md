# Neotravel — Automatisation du Processus Commercial

> Projet étudiant — Automatisation du cycle commercial d'une PME de transport de groupe.

## Liens

- [Board Agile Notion](https://app.notion.com/p/3877e71d574681eb9bd2c8bbbbad5e4a)
- [Déploiement Vercel](lien_à_ajouter)
- [Instance n8n](lien_à_ajouter)

## Stack

**Option choisie** : [A — n8n / B — Vercel AI SDK]  
**Justification** : [à compléter]

| Brique | Outil |
|---|---|
| Front | Next.js + Tailwind — Vercel |
| Agent IA | [n8n AI Agent / Vercel AI SDK] |
| Données | [Airtable / Supabase] |
| Calcul devis | calculer_devis() — jamais le LLM |
| Emails | Resend |
| Relances | n8n Schedule Trigger |

## Lancement en local

```bash
git clone https://github.com/TON_USERNAME/neotravel-automation.git
cd neotravel-automation
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

Voir `.env.example` pour la liste complète.  
Ne jamais committer `.env.local`.

## Architecture

```
Prospect → Landing (Next.js)
        → Chatbot → Agent IA
        → calculer_devis() [code déterministe]
        → CRM [Airtable / Supabase]
        → PDF devis → Email → Relances → Dashboard
```

## Structure

```
src/tools/       → calculer_devis() et tools déterministes
src/agent/       → prompt système de l'agent
src/lib/         → clients Airtable / Supabase
src/types/       → types TypeScript partagés
src/app/         → pages Next.js
docs/            → journal de décisions, architecture
workflows/       → export JSON workflows n8n
tests/           → golden set
```

## Équipe

| Membre | Rôle |
|---|---|
| [Prénom A] | PM / Analyste |
| [Prénom B] | Dev backend |
| [Prénom C] | Dev front / Intégrations |

## Règle d'or

> L'agent IA décide — les outils exécutent.  
> `calculer_devis()` est toujours du code, jamais le LLM.
