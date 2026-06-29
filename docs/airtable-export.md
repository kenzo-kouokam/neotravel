# Export Airtable — Base « NeoTravel V2 - Option A »

> Base ID : `appqJ7LO7TyFkLQ6h` · Export du 2026-06-29 · 8 tables

---

## 1. Parametres_Globaux (`tbl7nLUUXxvPKOxXe`) — 1 enregistrement

| Paramètre | Valeur |
|---|---|
| SEUIL_HITL_PRIX | 15 000 |
| SEUIL_HITL_PAX | 85 |
| SEUIL_URGENCE_TEMPS | 24 |
| MARGE_COMMERCIALE | 15 % |
| TVA_TRANSPORT | 10 % |
| SEUIL_DIST_FORFAIT | 180 |
| PRIX_KM_HORS_FORFAIT | 5 |
| Seuil_Nuit_KM | 500 |
| PRIX_NUIT_CHAUFFEUR | 120 |
| PRIX_GUIDE_JOUR | 80 |
| TODAY | 2026-06-29 (formule) |

---

## 2. xxx — Paramètres descriptifs (`tblkT7fTF49KzUzHa`) — 6 enregistrements

| ID_Parametre | Valeur | Unité | Description |
|---|---|---|---|
| SEUIL_HITL_PRIX | 15 000 | EUR | Seuil de débrayage humain financier |
| SEUIL_HITL_PAX | 85 | MAX | Capacité maximale pour calcul automatique |
| SEUIL_DIST_FORFAIT | 180 | KM | Distance limite pour application du forfait |
| PRIX_KM_HORS_FORFAIT | 5 | EUR/KM | Tarif au KM au-delà du forfait |
| MARGE_COMMERCIALE | 0,15 | POURCENTAGE | Marge NeoTravel |
| TVA_TRANSPORT | 0,10 | POURCENTAGE | TVA légale transport voyageurs |

---

## 3. Forfaits_KM (`tblsdHbDtjTU1vcHG`) — 16 enregistrements

| Palier_KM | Tarif_Forfait_HT (€) |
|---|---|
| <=30 | 250 |
| >30 et <=40 | 320 |
| >40 et <=50 | 350 |
| >50 et <=60 | 390 |
| >60 et <=70 | 430 |
| >70 et <=80 | 500 |
| >80 et <=90 | 540 |
| >90 et <=100 | 580 |
| >100 et <=110 | 620 |
| >110 et <=120 | 660 |
| >120 et <=130 | 700 |
| >130 et <=140 | 740 |
| >140 et <=150 | 780 |
| >150 et <=160 | 820 |
| >160 et <=170 | 860 |
| >170 et <=180 | 900 |

---

## 4. Matrices (`tblR3GEeeY0xy42Bs`) — 13 enregistrements

| ID_Critere | Type_Critere | Valeur_Cle | Coefficient |
|---|---|---|---|
| DD_PRIORITAIRE | Anticipation | <=2 | +10 % |
| DD_URGENT | Anticipation | >2 et <=7 | +5 % |
| DD_NORMAL | Anticipation | >7 et <90 | −5 % |
| DD_3MOISETPLUS | Anticipation | >=90 | −10 % |
| CAP_MINIBUS | Capacite | <=19 | −5 % |
| CAP_STANDARD | Capacite | >19 et <=53 | 0 % |
| CAP_GT | Capacite | >53 et <=63 | +15 % |
| CAP_XL | Capacite | >63 et <=67 | +20 % |
| CAP_DOUBLE | Capacite | >67 et <=85 | +40 % |
| S_BASSE | Saisonnalite | novembre, janvier, fevrier, aout | −7 % |
| S_MOYENNE | Saisonnalite | decembre, octobre, septembre | 0 % |
| S_HAUTE | Saisonnalite | mars, avril, juillet | +10 % |
| S_TRES_HAUTE | Saisonnalite | mai, juin | +15 % |

---

## 5. Demandes_Schema (`tblIxlPvgHVdJ9LmR`) — 52 enregistrements

> Distance en km (champ `Distance_Saisie_M` ÷ 1000). Type : AR = Aller-Retour, S = Aller-Simple.

| ID | Client | Trajet | Type | Pax | Date départ | Dist (km) | Statut | Intervention | Guide |
|---|---|---|---|---|---|---|---|---|---|
| 22 | Yas Rousseau | Paris→Berlin | AR | 40 | 2026-06-28 | 440,3 | Humain | Urgence, International | Oui |
| 23 | Thomas Rousseau | Paris→Lyon | AR | 35 | 2026-10-15 | 465,4 | **Accepte** | Standard | Oui |
| 24 | Thomas Rousseau | Paris→Lyon | AR | 35 | 2026-10-15 | 465,4 | Nouveau | Standard | Oui |
| 25 | Thomas Rousseau | Paris→Lyon | AR | 35 | 2026-10-15 | 465,4 | Nouveau | Standard | Oui |
| 26 | Thomas Rousseau | Paris→Lyon | AR | 35 | 2026-10-15 | 465,4 | Nouveau | Standard | Oui |
| 27 | Amine | Lille→Reims | AR | 75 | 2026-12-15 | 202,6 | Nouveau | Standard | Oui |
| 28 | ZZZZ | Lille→Reims | AR | 100 | 2026-12-15 | 202,6 | Humain | Hors-Capacite | Oui |
| 29 | AAA | Lille→Reims | AR | 100 | 2026-12-15 | 202,6 | Humain | Hors-Capacite | Oui |
| 30 | Yas Rousseau | Paris→Berlin | AR | 40 | 2026-06-28 | 440,3 | Humain | Urgence, International | Oui |
| 31 | Yas Rousseau | Paris→Berlin | AR | 40 | 2026-06-30 | 440,3 | Humain | Urgence, International | Oui |
| 32 | Yas Rousseau | Paris→Berlin | AR | 40 | 2026-06-30 | 440,3 | Humain | Urgence, International | Oui |
| 33 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-06-30 | 778,7 | Humain | Urgence | Oui |
| 34 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Humain | Urgence | Oui |
| 35 | TATARousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Humain | Urgence | Oui |
| 36 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 37 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 38 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 39 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 40 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 41 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 42 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 43 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 44 | ActuWeb | Lyon→Annecy | S | 50 | 2026-07-15 | 138,8 | Nouveau | Standard | Non |
| 45 | Marine | Marseille→Paris | S | 15 | 2026-09-12 | 776,7 | **Refuse** | Standard | Oui |
| 46 | Assoc. Sportive Lyon | Lyon→Genève | AR | 85 | 2026-07-20 | 311,2 | Humain | International | Non |
| 47 | Pierre | Lyon→Grenoble | S | 40 | 2026-06-29 | 107,4 | Humain | Urgence | Non |
| 48 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 49 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 50 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 51 | Yas Rousseau | Paris→Marseille | AR | 40 | 2026-07-25 | 778,7 | Nouveau | Standard | Oui |
| 52 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 53 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 54 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 55 | *(vide)* | — | — | — | — | 0 | *(vide)* | — | — |
| 56 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |
| 57 | Yas Rousseau | Lille→Roubaix | S | 15 | 2026-11-10 | 15,1 | **Devis_Ok** | Standard | Non |
| 58 | Alex Martin | Lyon→Annecy | AR | 80 | 2026-06-30 | 138,8 | Nouveau | Standard | Oui |
| 59 | Marie Dupuis | Marseille→Nice | AR | 45 | 2026-07-25 | 201,8 | **Refuse** | Standard | Oui |
| 60 | Jean Dupont | Bordeaux→Arcachon | S | 60 | 2026-09-15 | 67,7 | **Accepte** | Standard | Non |
| 61 | Yas Rousseau | Lille→Lyon | AR | 40 | 2026-07-25 | 692,5 | Nouveau | Standard | Oui |
| 62 | Yas Rousseau | Lille→Lyon | AR | 40 | 2026-07-25 | 692,5 | Nouveau | Standard | Oui |
| 63 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Accepte** | Standard | Oui |
| 64 | Yas Rousseau | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 65 | Momo | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 66 | MathisZZZZZ | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 67 | MathisZZZZZ | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 68 | MathisZZZZZ | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | Nouveau | Standard | Oui |
| 69 | MathisZZZZZ | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |
| 70 | BOUUUUUUUUU | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |
| 71 | KKKKKKK | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |
| 72 | BOUUUUUUUUU | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |
| 73 | BOUUUUUUUUU | Lille→Roubaix | AR | 40 | 2026-07-25 | 15,1 | **Devis_Ok** | Standard | Oui |

**Répartition statuts** : Nouveau 30 · Humain 11 · Devis_Ok 7 · Accepte 3 · Refuse 2 · *(vide)* 1 = 52 (taux sans intervention humaine ≈ 79 %)

---

## 6. Devis_Schema (`tbl3GuInzlUgtA7PK`) — 19 enregistrements

| ID | Demande | HT brut (€) | Coef S./A./C. | Total HT (€) | Marge (€) | TVA (€) | **TTC (€)** | Validation |
|---|---|---|---|---|---|---|---|---|
| 1 | — | 1125 | +15 / — / — | 1423,13 | 185,63 | 142,31 | 1565,44 | En_Attente |
| 2 | — | — | — | — | — | — | 1000 | En_Attente |
| 3 | — | 320 | +10 / −5 / — | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 4 | #23 | 4654,16 | 0 / −10 / 0 | 4817,06 | 628,31 | 481,71 | **5298,77** | Validé |
| 5 | #63 | 500 | +10 / −5 / 0 | 600,88 | 78,38 | 60,09 | 660,97 | Validé |
| 6 | #60 | 430 | 0 / −5 / +15 | 540,24 | 70,47 | 54,02 | 594,26 | Validé |
| 7 | #59 | 2018,38 | +10 / −5 / 0 | 2425,58 | 316,38 | 242,56 | 2668,14 | Validé |
| 8 | #45 | 3883,44 | 0 / −5 / −5 | 4030,53 | 525,72 | 403,05 | 4433,58 | Validé |
| 9 | #57 | 250 | −7 / −10 / −5 | 228,61 | 29,82 | 22,86 | 251,47 | En_Attente |
| 10 | #56 | 500 | +10 / −5 / 0 | 600,88 | 78,38 | 60,09 | 660,97 | En_Attente |
| 11 | #65 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 12 | #66 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 13 | #67 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 14 | #68 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 15 | #69 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 16 | #70 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 17 | #71 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 18 | #72 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |
| 19 | #73 | 320 | +10 / −5 / 0 | 1976,47 | 296,47 | 197,65 | 2174,12 | En_Attente |

> Coef S./A./C. = Saison / Anticipation / Capacité. Devis #3 et #11→19 incluent des frais guide (560 €) + nuités (720 €).
> **CA gagné (devis liés aux demandes Accepte #23/#63/#60)** = 5298,77 + 660,97 + 594,26 = **6553,99 €**.

---

## 7. Relances_Schema (`tblkJq9PZQgHhLwr0`) — 3 enregistrements

| ID | Type_Relance | Date_Envoi_Prevue | Statut_Envoi |
|---|---|---|---|
| 1 | *(vide)* | 2026-06-27 | *(vide)* |
| 2 | Relance_J3 | 2026-06-25 | *(vide)* |
| 3 | *(vide)* | *(vide)* | *(vide)* |

---

## 8. Logs_Observabilite (`tblPu3TJcRPJB04cC`) — 42 enregistrements

> Données normalisées le 29/06 (le coût était à 0 partout → recalculé depuis les tokens).

Valeurs **uniformes** sur les 42 logs (un log par demande traitée) :

| Champ | Valeur |
|---|---|
| Tokens_In | 2 500 |
| Tokens_Out | 400 |
| Cout_Estime_Inference | 0,001125 € |
| Duree_Execution_MS | 1 240 (sauf log #3 = 0) |

**Cumuls** : Tokens In 105 000 · Tokens Out 16 800 · Coût IA total ≈ **0,047 €** · Latence moyenne ≈ 1,2 s.

---

### Synthèse business
- **52 demandes** · 79 % traitées sans intervention humaine
- **19 devis** émis · CA gagné **6 554 €** · panier moyen ≈ 1 870 € TTC
- **Coût IA total ≈ 0,05 €** pour l'ensemble des traitements
