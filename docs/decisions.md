# Journal de Décisions — Neotravel

> Ce document est tenu à jour tout au long de la semaine.
> Chaque décision importante est consignée avec sa date, son contexte et ses arguments.
> Il est évalué dans le cadre de la démarche Agile (Bloc A — 4 pts).

---

## [22/06] Choix de stack

**Décision** : Option A — n8n

**Arguments pour** :
- Orchestration visuelle des workflows sans code
- AI Agent natif avec gestion des tools
- Schedule Trigger intégré pour les relances
- Pas de vendor lock-in LLM (compatible OpenAI, Anthropic, etc.)

**Arguments contre** :
- Instance à héberger ou payer (n8n Cloud)
- Moins de contrôle fin que du code pur

**Risques identifiés** :
- Disponibilité de l'instance n8n en production

---

## [22/06] Périmètre MVP

**Dans le périmètre** :
- Captation lead (chatbot)
- CRM automatique
- Qualification + détection champs manquants
- calculer_devis() + PDF
- Envoi email
- Relances n8n
- Dashboard

**Hors périmètre** :
- Multi-langue
- WhatsApp
- Interface backoffice complète

---

## [22/06] Répartition des rôles

| Membre | Rôle |
|---|---|
| Mohamed | PM / Analyste |
| Mathis | Dev backend |
| Omar | Dev front / Intégrations |

---

## [à compléter] Choix du modèle LLM

**Décision** :
**Justification** (coût / qualité / latence / sorties structurées / compatibilité stack) :

---
