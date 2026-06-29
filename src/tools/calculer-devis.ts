/**
 * calculer_devis() — Moteur de tarification déterministe de Neotravel.
 *
 * RÈGLE D'OR : ce module ne fait JAMAIS appel à un LLM. Le prix est calculé
 * de manière déterministe à partir des règles officielles Neotravel.
 *
 * Port TypeScript fidèle du moteur n8n (Code node) qui fait foi côté production.
 * Toutes les valeurs tarifaires (grille, coefficients, seuils) viennent d'Airtable :
 *   - Parametres_Globaux  → `params`
 *   - Matrices            → `matrices` (Capacite / Anticipation / Saisonnalite)
 *   - Forfaits_KM         → `forfaits`
 * En l'absence de config injectée, on utilise CONFIG_PRICING (miroir d'Airtable).
 */

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type TypeTrajet = "Aller-Simple" | "Aller-Retour";
export type TypeCritere = "Capacite" | "Anticipation" | "Saisonnalite";

/** Une ligne de la table Matrices (Airtable). */
export interface Matrice {
  ID_Critere: string;
  Type_Critere: TypeCritere;
  /** Règle d'intervalle ("<=2", ">19 et <=53") ou liste de mois pour la saison. */
  Valeur_Cle: string;
  /** Coefficient en fraction (0.15 = +15 %). */
  Coefficient: number;
}

/** Une ligne de la table Forfaits_KM (Airtable). */
export interface Forfait {
  /** Règle d'intervalle de distance ("<=30", ">110 et <=120"). */
  Palier_KM: string;
  Tarif_Forfait_HT: number;
}

/** Paramètres globaux (table Parametres_Globaux). */
export interface ParametresGlobaux {
  SEUIL_DIST_FORFAIT: number;
  PRIX_KM_HORS_FORFAIT: number;
  PRIX_NUIT_CHAUFFEUR: number;
  PRIX_GUIDE_JOUR: number;
  /** Marge commerciale en fraction (0.15 = 15 %). */
  MARGE_COMMERCIALE: number;
  /** TVA en fraction (0.10 = 10 %). */
  TVA_TRANSPORT: number;
  /** Date pivot pour l'anticipation (ISO). Défaut : aujourd'hui. */
  TODAY?: string;
}

export interface ConfigPricing {
  params: ParametresGlobaux;
  matrices: Matrice[];
  forfaits: Forfait[];
}

/** Entrée de calcul (champs de la demande client). */
export interface ParamsDevis {
  nb_passagers: number;
  /** Distance d'un aller, en mètres (sortie du nœud de routing). */
  distance_metres: number;
  /** Date de départ (ISO). */
  date_depart: string;
  /** Date de retour (ISO) — déclenche les nuits chauffeur si présente. */
  date_retour?: string;
  type_trajet?: TypeTrajet;
  option_guide?: boolean;
  /** Surcharge la date pivot d'anticipation (sinon params.TODAY puis maintenant). */
  date_reference?: string;
}

export interface ResultatDevis {
  prix_ht: number;
  prix_ttc: number;
  tva: number;
  distance_totale_km: number;
  devise: "EUR";
  details: {
    type_tarification: string;
    aller_simple_km: number;
    distance_facturee_km: number;
    jours_mobilises: number;
    nuits_chauffeur: number;
    matrices: {
      capacite: { regle: string; coef: number };
      saisonnalite: { regle: string; coef: number };
      anticipation: { regle: string; coef: number };
      impact_total_coef: number;
    };
    couts: {
      transport_sec: number;
      frais_nuites: number;
      frais_guide: number;
      sous_total_avant_coef: number;
      cout_revient_apres_coef: number;
    };
    taxes_et_marge: {
      marge_commerciale: number;
      montant_marge: number;
      tva_appliquee: number;
      montant_tva: number;
    };
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Moteur d'analyse d'intervalles (port fidèle du Code node n8n)
// ──────────────────────────────────────────────────────────────────────────

function verifierCondition(valeur: number, conditionStr: string): boolean {
  if (!conditionStr) return false;
  conditionStr = String(conditionStr).trim();
  if (conditionStr.startsWith("<=")) return valeur <= parseFloat(conditionStr.replace("<=", ""));
  if (conditionStr.startsWith("<")) return valeur < parseFloat(conditionStr.replace("<", ""));
  if (conditionStr.startsWith(">=")) return valeur >= parseFloat(conditionStr.replace(">=", ""));
  if (conditionStr.startsWith(">")) return valeur > parseFloat(conditionStr.replace(">", ""));
  return false;
}

function matchPalier(valeur: number, regleAirtable: string): boolean {
  if (!regleAirtable) return false;
  const parties = String(regleAirtable).split(" et ").map((s) => s.trim());
  if (parties.length === 2) {
    return verifierCondition(valeur, parties[0]) && verifierCondition(valeur, parties[1]);
  }
  return verifierCondition(valeur, regleAirtable);
}

function arrondi(montant: number): number {
  return Math.round(montant * 100) / 100;
}

const MOIS_NOMS = [
  "janvier", "fevrier", "mars", "avril", "mai", "juin",
  "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
];

// ──────────────────────────────────────────────────────────────────────────
// Fonction principale
// ──────────────────────────────────────────────────────────────────────────

export function calculerDevis(input: ParamsDevis, config: ConfigPricing = CONFIG_PRICING): ResultatDevis {
  const { params, matrices, forfaits } = config;

  const today = input.date_reference
    ? new Date(input.date_reference)
    : params.TODAY
      ? new Date(params.TODAY)
      : new Date();

  // 1. Trajet et distances
  const distanceUnTrajetKm = (input.distance_metres || 0) / 1000;
  const multiplicateurTrajet = input.type_trajet === "Aller-Retour" ? 2 : 1;
  const distanceTotaleKm = distanceUnTrajetKm * multiplicateurTrajet;

  // 2. Planning (nuits / jours)
  let nbNuits = 0;
  let nbJours = 1;
  if (input.date_depart && input.date_retour) {
    const d1 = new Date(input.date_depart);
    const d2 = new Date(input.date_retour);
    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      nbNuits = diffDays;
      nbJours = diffDays + 1;
    }
  }

  // 3. Coefficients (Matrices) — additifs
  const pax = input.nb_passagers || 0;
  const matCapacite = matrices.find((m) => m.Type_Critere === "Capacite" && matchPalier(pax, m.Valeur_Cle));
  const coefCapacite = matCapacite ? Number(matCapacite.Coefficient) : 0;
  const idCapacite = matCapacite ? matCapacite.ID_Critere : "AUCUN";

  const dDepart = new Date(input.date_depart);
  const joursAnticipation = Math.floor((dDepart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const matAnticipation = matrices.find((m) => m.Type_Critere === "Anticipation" && matchPalier(joursAnticipation, m.Valeur_Cle));
  const coefAnticipation = matAnticipation ? Number(matAnticipation.Coefficient) : 0;
  const idAnticipation = matAnticipation ? matAnticipation.ID_Critere : "AUCUN";

  const moisDepart = !isNaN(dDepart.getTime()) ? MOIS_NOMS[dDepart.getUTCMonth()] : "inconnu";
  const matSaison = matrices.find(
    (m) => m.Type_Critere === "Saisonnalite" && String(m.Valeur_Cle).toLowerCase().includes(moisDepart),
  );
  const coefSaison = matSaison ? Number(matSaison.Coefficient) : 0;
  const idSaison = matSaison ? matSaison.ID_Critere : "AUCUN";

  const coefGlobalMatrices = coefCapacite + coefAnticipation + coefSaison;

  // 4. Coûts secs (paramètres dynamiques)
  const SEUIL = Number(params.SEUIL_DIST_FORFAIT);
  const prixKmHorsForfait = Number(params.PRIX_KM_HORS_FORFAIT);

  let coutTransportSec: number;
  let detailsForfait: string;

  if (distanceTotaleKm > 0 && distanceTotaleKm <= SEUIL) {
    const forfaitTrouve = forfaits.find((f) => matchPalier(distanceTotaleKm, f.Palier_KM));
    if (forfaitTrouve && forfaitTrouve.Tarif_Forfait_HT) {
      coutTransportSec = Number(forfaitTrouve.Tarif_Forfait_HT);
      detailsForfait = `Forfait appliqué: Règle [ ${forfaitTrouve.Palier_KM} ] (pour ${distanceTotaleKm.toFixed(2)} km réels)`;
    } else {
      coutTransportSec = distanceTotaleKm * prixKmHorsForfait;
      detailsForfait = `Erreur: Aucun palier valide pour ${distanceTotaleKm.toFixed(2)} km - Tarif au KM réel activé`;
    }
  } else {
    coutTransportSec = distanceTotaleKm * prixKmHorsForfait;
    detailsForfait = `Tarif au KM réel activé (${distanceTotaleKm.toFixed(2)} km > ${SEUIL} km)`;
  }

  const prixNuitChauffeur = Number(params.PRIX_NUIT_CHAUFFEUR);
  const prixGuideJour = Number(params.PRIX_GUIDE_JOUR);

  const coutNuites = nbNuits * prixNuitChauffeur;
  const coutGuide = input.option_guide ? nbJours * prixGuideJour : 0;

  const sousTotalBrut = coutTransportSec + coutNuites + coutGuide;

  // 5. Application finale (coefficients additifs, marge, TVA)
  const coutApresMatrices = sousTotalBrut * (1 + coefGlobalMatrices);

  const margeCommerciale = Number(params.MARGE_COMMERCIALE);
  const prixDeVenteHT = coutApresMatrices / (1 - margeCommerciale);

  const tva = Number(params.TVA_TRANSPORT);
  const prixDeVenteTTC = prixDeVenteHT * (1 + tva);
  const montantTVA = prixDeVenteTTC - prixDeVenteHT;

  return {
    prix_ht: arrondi(prixDeVenteHT),
    prix_ttc: arrondi(prixDeVenteTTC),
    tva: arrondi(montantTVA),
    distance_totale_km: arrondi(distanceTotaleKm),
    devise: "EUR",
    details: {
      type_tarification: detailsForfait,
      aller_simple_km: arrondi(distanceUnTrajetKm),
      distance_facturee_km: arrondi(distanceTotaleKm),
      jours_mobilises: nbJours,
      nuits_chauffeur: nbNuits,
      matrices: {
        capacite: { regle: idCapacite, coef: coefCapacite },
        saisonnalite: { regle: idSaison, coef: coefSaison },
        anticipation: { regle: idAnticipation, coef: coefAnticipation },
        impact_total_coef: coefGlobalMatrices,
      },
      couts: {
        transport_sec: arrondi(coutTransportSec),
        frais_nuites: arrondi(coutNuites),
        frais_guide: arrondi(coutGuide),
        sous_total_avant_coef: arrondi(sousTotalBrut),
        cout_revient_apres_coef: arrondi(coutApresMatrices),
      },
      taxes_et_marge: {
        marge_commerciale: margeCommerciale,
        montant_marge: arrondi(prixDeVenteHT - coutApresMatrices),
        tva_appliquee: tva,
        montant_tva: arrondi(montantTVA),
      },
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Config par défaut — miroir exact de la base Airtable "NeoTravel V2"
// ──────────────────────────────────────────────────────────────────────────

export const CONFIG_PRICING: ConfigPricing = {
  params: {
    SEUIL_DIST_FORFAIT: 180,
    PRIX_KM_HORS_FORFAIT: 5,
    PRIX_NUIT_CHAUFFEUR: 120,
    PRIX_GUIDE_JOUR: 80,
    MARGE_COMMERCIALE: 0.15,
    TVA_TRANSPORT: 0.1,
  },
  matrices: [
    // Anticipation (jours avant départ)
    { ID_Critere: "DD_PRIORITAIRE", Type_Critere: "Anticipation", Valeur_Cle: "<=2", Coefficient: 0.1 },
    { ID_Critere: "DD_URGENT", Type_Critere: "Anticipation", Valeur_Cle: ">2 et <=7", Coefficient: 0.05 },
    { ID_Critere: "DD_NORMAL", Type_Critere: "Anticipation", Valeur_Cle: ">7 et <90", Coefficient: -0.05 },
    { ID_Critere: "DD_3MOISETPLUS", Type_Critere: "Anticipation", Valeur_Cle: ">=90", Coefficient: -0.1 },
    // Capacité (passagers)
    { ID_Critere: "CAP_MINIBUS", Type_Critere: "Capacite", Valeur_Cle: "<=19", Coefficient: -0.05 },
    { ID_Critere: "CAP_STANDARD", Type_Critere: "Capacite", Valeur_Cle: ">19 et <=53", Coefficient: 0 },
    { ID_Critere: "CAP_GT", Type_Critere: "Capacite", Valeur_Cle: ">53 et <=63", Coefficient: 0.15 },
    { ID_Critere: "CAP_XL", Type_Critere: "Capacite", Valeur_Cle: ">63 et <=67", Coefficient: 0.2 },
    { ID_Critere: "CAP_DOUBLE", Type_Critere: "Capacite", Valeur_Cle: ">67 et <=85", Coefficient: 0.4 },
    // Saisonnalité (mois de départ)
    { ID_Critere: "S_MOYENNE", Type_Critere: "Saisonnalite", Valeur_Cle: "decembre, octobre, septembre", Coefficient: 0 },
    { ID_Critere: "S_HAUTE", Type_Critere: "Saisonnalite", Valeur_Cle: "mars, avril, juillet", Coefficient: 0.1 },
    { ID_Critere: "S_TRES_HAUTE", Type_Critere: "Saisonnalite", Valeur_Cle: "mai, juin", Coefficient: 0.15 },
    { ID_Critere: "S_BASSE", Type_Critere: "Saisonnalite", Valeur_Cle: "novembre, janvier, fevrier, aout", Coefficient: -0.07 },
  ],
  forfaits: [
    { Palier_KM: "<=30", Tarif_Forfait_HT: 250 },
    { Palier_KM: ">30 et <=40", Tarif_Forfait_HT: 320 },
    { Palier_KM: ">40 et <=50", Tarif_Forfait_HT: 350 },
    { Palier_KM: ">50 et <=60", Tarif_Forfait_HT: 390 },
    { Palier_KM: ">60 et <=70", Tarif_Forfait_HT: 430 },
    { Palier_KM: ">70 et <=80", Tarif_Forfait_HT: 500 },
    { Palier_KM: ">80 et <=90", Tarif_Forfait_HT: 540 },
    { Palier_KM: ">90 et <=100", Tarif_Forfait_HT: 580 },
    { Palier_KM: ">100 et <=110", Tarif_Forfait_HT: 620 },
    { Palier_KM: ">110 et <=120", Tarif_Forfait_HT: 660 },
    { Palier_KM: ">120 et <=130", Tarif_Forfait_HT: 700 },
    { Palier_KM: ">130 et <=140", Tarif_Forfait_HT: 740 },
    { Palier_KM: ">140 et <=150", Tarif_Forfait_HT: 780 },
    { Palier_KM: ">150 et <=160", Tarif_Forfait_HT: 820 },
    { Palier_KM: ">160 et <=170", Tarif_Forfait_HT: 860 },
    { Palier_KM: ">170 et <=180", Tarif_Forfait_HT: 900 },
  ],
};
