/**
 * calculer_devis() — Moteur de tarification déterministe de Neotravel.
 *
 * RÈGLE D'OR : ce module ne fait JAMAIS appel à un LLM. Le prix est calculé
 * de manière déterministe, documentée et auditable à partir des matrices
 * tarifaires ci-dessous. L'agent IA appelle cette fonction comme un outil ;
 * il ne calcule jamais lui-même.
 *
 * Toutes les matrices sont regroupées dans `CONFIG_PRICING` pour pouvoir être
 * modifiées sans toucher à la logique de calcul.
 */

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type TypeVehicule = "minibus" | "autocar" | "double_etage";

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
  type_vehicule?: TypeVehicule;
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
  /** Base distance. Valeurs par défaut — à aligner sur les règles internes. */
  base: {
    prix_km: 2.5, // €/km
    prix_minimum: 250, // € plancher
  },

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
   * Seuils en jours d'anticipation (hypothèses documentées, à confirmer avec
   * les règles de pricing complètes de Neotravel).
   */
  urgence: {
    prioritaire: { seuil_max_jours: 7, libelle: "DD_PRIORITAIRE", taux: 0.1 },
    urgent: { seuil_max_jours: 30, libelle: "DD_URGENT", taux: 0.05 },
    normal: { seuil_max_jours: 90, libelle: "DD_NORMAL", taux: -0.05 },
    anticipe: { libelle: "DD_3MOISETPLUS", taux: -0.1 }, // >= 90 jours
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

  /** Tableau 3 — Options & TVA & marge. */
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
  // Garanti non-null car nbPassagers <= capacite_max est vérifié en amont.
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
    options = [],
  } = params;

  // --- Validation des entrées (cas limites) ---
  if (!Number.isFinite(nb_passagers) || nb_passagers <= 0) {
    throw new Error("Nombre de passagers invalide (doit être > 0).");
  }
  if (nb_passagers > CONFIG_PRICING.capacite_max) {
    throw new Error(
      `Capacité dépassée (${nb_passagers} > ${CONFIG_PRICING.capacite_max}). ` +
        "Escalade vers un commercial humain requise.",
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

  // --- 1. Base distance ---
  const baseDistance = Math.max(
    distance_km * CONFIG_PRICING.base.prix_km,
    CONFIG_PRICING.base.prix_minimum,
  );

  // --- 2. Coefficients (saison, urgence, capacité) appliqués à la base ---
  const coefficients: Coefficient[] = [
    coefficientSaison(dDepart),
    coefficientUrgence(dDemande, dDepart),
    coefficientCapacite(nb_passagers),
  ];
  const facteur = coefficients.reduce((acc, c) => acc * (1 + c.taux), 1);
  const baseAjustee = baseDistance * facteur;

  const lignes: LigneDevis[] = [
    { libelle: "Transport (base distance)", montant: arrondi(baseDistance) },
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

  // --- 4. Marge commerciale (+15 % avant envoi) ---
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
