/**
 * calculer_devis() — Moteur de tarification déterministe de Neotravel.
 *
 * RÈGLE D'OR : ce module ne fait JAMAIS appel à un LLM. Le prix est calculé
 * de manière déterministe, documentée et auditable à partir des règles
 * officielles "REGLES DE CALCUL COTATION DEVIS NEOTRAVEL".
 *
 * Source des matrices :
 *   - PDF "REGLES DE CALCUL COTATION DEVIS NEOTRAVEL" (grille forfait, A/R,
 *     coefficients, marge).
 *   - Brief général Neotravel (TVA 10 %, options guide/nuit chauffeur/péages).
 */

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type TypeTrajet = "simple" | "aller_retour";

export type TypeOption =
  | "guide" // accompagnateur — +80 €/jour
  | "nuit_chauffeur" // +120 €/nuit
  | "peages"; // forfait selon trajet (montant fourni)

export interface Option {
  type: TypeOption;
  /** Nombre de jours (guide) ou de nuits (nuit_chauffeur). Défaut : 1. */
  quantite?: number;
  /** Montant forfaitaire en €, requis pour `peages`. */
  montant?: number;
}

export interface ParamsDevis {
  nb_passagers: number;
  /** Date de départ (ISO 8601, ex. "2026-07-14"). */
  date_depart: string;
  /** Date de la demande (ISO 8601). Défaut : aujourd'hui. */
  date_demande?: string;
  distance_km: number;
  /** "simple" (aller seul) ou "aller_retour". Défaut : "simple". */
  type_trajet?: TypeTrajet;
  options?: Option[];
}

export interface LigneDevis {
  libelle: string;
  montant: number;
}

export interface Coefficient {
  libelle: string;
  /** Coefficient appliqué, ex. 0.15 pour +15 %. */
  taux: number;
}

export interface ResultatDevis {
  prix_ht: number;
  tva: number;
  prix_ttc: number;
  lignes: LigneDevis[];
  coefficients: Coefficient[];
  devise: "EUR";
}

// ──────────────────────────────────────────────────────────────────────────
// Configuration des matrices tarifaires (auditable / modifiable)
// ──────────────────────────────────────────────────────────────────────────

export const CONFIG_PRICING = {
  /**
   * Grille de tarif au forfait (transfert simple) jusqu'à 180 km.
   * Clé = palier KM (arrondi supérieur à la dizaine), valeur = prix forfait en €.
   * Source : PDF officiel "REGLES DE CALCUL COTATION DEVIS NEOTRAVEL".
   */
  grille_forfait_km: {
    10: 250,
    20: 250,
    30: 250,
    40: 320,
    50: 350,
    60: 390,
    70: 430,
    80: 500,
    90: 540,
    100: 580,
    110: 620,
    120: 660,
    130: 700,
    140: 740,
    150: 780,
    160: 820,
    170: 860,
    180: 900,
  } as Record<number, number>,

  /** Au-delà de 180 km (transfert simple) : (KM × 2) × 2,5 €/km = 5 €/km. */
  prix_km_au_dela: 5,
  seuil_forfait_km: 180,

  /** Tableau 2a — Saisonnalité, par mois de départ (1 = janvier). */
  saisonnalite: {
    1: { libelle: "Basse", taux: -0.07 },
    2: { libelle: "Basse", taux: -0.07 },
    8: { libelle: "Basse", taux: -0.07 },
    11: { libelle: "Basse", taux: -0.07 },
    9: { libelle: "Moyenne", taux: 0 },
    10: { libelle: "Moyenne", taux: 0 },
    12: { libelle: "Moyenne", taux: 0 },
    3: { libelle: "Haute", taux: 0.1 },
    4: { libelle: "Haute", taux: 0.1 },
    7: { libelle: "Haute", taux: 0.1 },
    5: { libelle: "Très haute", taux: 0.15 },
    6: { libelle: "Très haute", taux: 0.15 },
  } as Record<number, { libelle: string; taux: number }>,

  /**
   * Tableau 2b — Urgence (date demande vs date départ).
   * Les SEUILS EN JOURS ne sont pas dans le PDF officiel — hypothèses à
   * confirmer avec Neotravel. Les taux, eux, sont conformes au PDF.
   */
  urgence: {
    prioritaire: { seuil_max_jours: 7, libelle: "DD_PRIORITAIRE", taux: 0.1 },
    urgent: { seuil_max_jours: 30, libelle: "DD_URGENT", taux: 0.05 },
    normal: { seuil_max_jours: 90, libelle: "DD_NORMAL", taux: -0.05 },
    anticipe: { libelle: "DD_3MOISETPLUS", taux: -0.1 },
  },

  /** Tableau 2c — Capacité, par tranche de passagers. */
  capacite: [
    { max: 19, libelle: "≤ 19 passagers", taux: -0.05 },
    { max: 53, libelle: "20–53 passagers", taux: 0 },
    { max: 63, libelle: "54–63 passagers", taux: 0.15 },
    { max: 67, libelle: "64–67 passagers", taux: 0.2 },
    { max: 85, libelle: "68–85 passagers", taux: 0.4 },
  ],
  capacite_max: 85,

  /** Options (brief général Neotravel). */
  options: {
    guide: 80, // €/jour
    nuit_chauffeur: 120, // €/nuit
  },
  tva: 0.1, // 10 %
  marge_commerciale: 0.15, // +15 % appliqués avant envoi
} as const;

// ──────────────────────────────────────────────────────────────────────────
// Helpers déterministes
// ──────────────────────────────────────────────────────────────────────────

/** Arrondi monétaire à 2 décimales, stable. */
function arrondi(montant: number): number {
  return Math.round((montant + Number.EPSILON) * 100) / 100;
}

/**
 * Retourne la base de prix selon la grille forfaitaire (≤ 180 km) ou la
 * formule linéaire au-delà. Le palier KM est arrondi à la dizaine supérieure
 * (ex. 45 km → palier 50 km).
 */
function baseTransfertSimple(distance_km: number): number {
  if (distance_km <= CONFIG_PRICING.seuil_forfait_km) {
    const palier = Math.max(10, Math.ceil(distance_km / 10) * 10);
    return CONFIG_PRICING.grille_forfait_km[palier];
  }
  return distance_km * CONFIG_PRICING.prix_km_au_dela;
}

function coefficientSaison(dateDepart: Date): Coefficient {
  const mois = dateDepart.getUTCMonth() + 1;
  const s = CONFIG_PRICING.saisonnalite[mois];
  return { libelle: `Saison ${s.libelle}`, taux: s.taux };
}

function coefficientUrgence(dateDemande: Date, dateDepart: Date): Coefficient {
  const jours = Math.floor(
    (dateDepart.getTime() - dateDemande.getTime()) / (1000 * 60 * 60 * 24),
  );
  const u = CONFIG_PRICING.urgence;
  if (jours <= u.prioritaire.seuil_max_jours)
    return { libelle: u.prioritaire.libelle, taux: u.prioritaire.taux };
  if (jours <= u.urgent.seuil_max_jours)
    return { libelle: u.urgent.libelle, taux: u.urgent.taux };
  if (jours < u.normal.seuil_max_jours)
    return { libelle: u.normal.libelle, taux: u.normal.taux };
  return { libelle: u.anticipe.libelle, taux: u.anticipe.taux };
}

function coefficientCapacite(nbPassagers: number): Coefficient {
  const tranche = CONFIG_PRICING.capacite.find((t) => nbPassagers <= t.max);
  return { libelle: `Capacité ${tranche!.libelle}`, taux: tranche!.taux };
}

// ──────────────────────────────────────────────────────────────────────────
// Fonction principale
// ──────────────────────────────────────────────────────────────────────────

export function calculerDevis(params: ParamsDevis): ResultatDevis {
  const {
    nb_passagers,
    date_depart,
    date_demande,
    distance_km,
    type_trajet = "simple",
    options = [],
  } = params;

  // --- Validation des entrées (cas limites) ---
  if (!Number.isFinite(nb_passagers) || nb_passagers <= 0) {
    throw new Error("Nombre de passagers invalide (doit être > 0).");
  }
  if (nb_passagers > CONFIG_PRICING.capacite_max) {
    throw new Error(
      `Capacité dépassée (${nb_passagers} > ${CONFIG_PRICING.capacite_max}). ` +
        "Escalade vers un commercial humain requise (flux manuel).",
    );
  }
  if (!Number.isFinite(distance_km) || distance_km <= 0) {
    throw new Error("Distance invalide (doit être > 0 km).");
  }

  const dDepart = new Date(date_depart);
  const dDemande = date_demande ? new Date(date_demande) : new Date();
  if (Number.isNaN(dDepart.getTime())) {
    throw new Error("Date de départ invalide.");
  }
  if (Number.isNaN(dDemande.getTime())) {
    throw new Error("Date de demande invalide.");
  }
  if (dDepart.getTime() < dDemande.getTime()) {
    throw new Error(
      "Date incohérente : le départ est antérieur à la demande.",
    );
  }

  // --- 1. Base de prix selon grille forfait + aller-retour ---
  const baseSimple = baseTransfertSimple(distance_km);
  const baseDistance =
    type_trajet === "aller_retour" ? baseSimple * 2 : baseSimple;

  // --- 2. Coefficients (saison, urgence, capacité) appliqués à la base ---
  const coefficients: Coefficient[] = [
    coefficientSaison(dDepart),
    coefficientUrgence(dDemande, dDepart),
    coefficientCapacite(nb_passagers),
  ];
  const facteur = coefficients.reduce((acc, c) => acc * (1 + c.taux), 1);
  const baseAjustee = baseDistance * facteur;

  const libelleBase =
    type_trajet === "aller_retour"
      ? "Transfert aller/retour (base forfait)"
      : "Transfert simple (base forfait)";

  const lignes: LigneDevis[] = [
    { libelle: libelleBase, montant: arrondi(baseDistance) },
  ];
  for (const c of coefficients) {
    if (c.taux !== 0) {
      lignes.push({
        libelle: `${c.libelle} (${c.taux > 0 ? "+" : ""}${Math.round(
          c.taux * 100,
        )} %)`,
        montant: arrondi(baseDistance * c.taux),
      });
    }
  }

  // --- 3. Options (montants fixes) ---
  let totalOptions = 0;
  for (const opt of options) {
    const quantite = opt.quantite ?? 1;
    let montant: number;
    let libelle: string;
    switch (opt.type) {
      case "guide":
        montant = CONFIG_PRICING.options.guide * quantite;
        libelle = `Guide / accompagnateur (${quantite} j)`;
        break;
      case "nuit_chauffeur":
        montant = CONFIG_PRICING.options.nuit_chauffeur * quantite;
        libelle = `Nuit chauffeur (${quantite})`;
        break;
      case "peages":
        if (!Number.isFinite(opt.montant)) {
          throw new Error("Option péages : montant forfaitaire requis.");
        }
        montant = opt.montant!;
        libelle = "Péages (forfait)";
        break;
      default:
        throw new Error(`Option inconnue : ${(opt as Option).type}`);
    }
    totalOptions += montant;
    lignes.push({ libelle, montant: arrondi(montant) });
  }

  // --- 4. Marge commerciale (+15 %) ---
  const sousTotal = baseAjustee + totalOptions;
  const marge = sousTotal * CONFIG_PRICING.marge_commerciale;
  coefficients.push({
    libelle: "Marge commerciale",
    taux: CONFIG_PRICING.marge_commerciale,
  });
  lignes.push({ libelle: "Marge commerciale (+15 %)", montant: arrondi(marge) });

  // --- 5. Totaux HT / TVA / TTC ---
  const prix_ht = arrondi(sousTotal + marge);
  const tva = arrondi(prix_ht * CONFIG_PRICING.tva);
  const prix_ttc = arrondi(prix_ht + tva);

  return {
    prix_ht,
    tva,
    prix_ttc,
    lignes,
    coefficients,
    devise: "EUR",
  };
}
