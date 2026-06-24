import { describe, it, expect } from "vitest";
import { calculerDevis, CONFIG_PRICING } from "./calculer-devis";

/**
 * Golden set du moteur de tarification.
 * Conforme au PDF officiel "REGLES DE CALCUL COTATION DEVIS NEOTRAVEL".
 */

describe("calculerDevis — grille forfait (transfert simple ≤ 180 km)", () => {
  it("applique le forfait minimum 250 € sur trajet court (≤ 30 km)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15", // moyenne saison (0 %)
      date_demande: "2026-03-15", // > 90 j → -10 %
      distance_km: 25, // palier 30 km → 250 €
    });
    // 250 × 0.90 = 225 ; marge 33.75 → HT 258.75 ; TVA 25.88 → TTC 284.63
    expect(r.prix_ht).toBe(258.75);
    expect(r.tva).toBe(25.88);
    expect(r.prix_ttc).toBe(284.63);
  });

  it("applique le forfait au palier 100 km (580 €)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100,
    });
    // 580 × 0.90 = 522 ; marge 78.30 → HT 600.30
    expect(r.prix_ht).toBe(600.3);
  });

  it("arrondit la distance au palier supérieur (45 km → palier 50)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 45,
    });
    // 350 × 0.90 = 315 ; marge 47.25 → HT 362.25
    expect(r.prix_ht).toBe(362.25);
  });

  it("applique le forfait maximum 900 € à 180 km", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 180,
    });
    // 900 × 0.90 = 810 ; marge 121.50 → HT 931.50
    expect(r.prix_ht).toBe(931.5);
  });
});

describe("calculerDevis — formule au-delà de 180 km", () => {
  it("applique 5 €/km au-delà de 180 km", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 400, // 400 × 5 = 2000 €
    });
    // 2000 × 0.90 = 1800 ; marge 270 → HT 2070
    expect(r.prix_ht).toBe(2070);
  });
});

describe("calculerDevis — aller/retour", () => {
  it("double la base pour un trajet aller-retour (forfait)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100,
      type_trajet: "aller_retour", // 580 × 2 = 1160
    });
    // 1160 × 0.90 = 1044 ; marge 156.60 → HT 1200.60
    expect(r.prix_ht).toBe(1200.6);
  });

  it("double la base au-delà de 180 km en A/R", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 400, // simple 2000 ; A/R 4000
      type_trajet: "aller_retour",
    });
    // 4000 × 0.90 = 3600 ; marge 540 → HT 4140
    expect(r.prix_ht).toBe(4140);
  });
});

describe("calculerDevis — coefficients", () => {
  it("applique la très haute saison (juin +15 %)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-06-20",
      date_demande: "2026-01-20", // -10 %
      distance_km: 100, // 580
    });
    // facteur = 1.15 × 0.90 = 1.035 → 600.30 ; marge 90.045 → HT 690.34
    expect(r.prix_ht).toBe(690.34);
  });

  it("majore la capacité 54–63 passagers (+15 %)", () => {
    const r = calculerDevis({
      nb_passagers: 60,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100,
    });
    // facteur = 1.15 × 0.90 = 1.035 → 600.30 ; marge 90.045 → HT 690.34
    expect(r.prix_ht).toBe(690.34);
  });

  it("applique la majoration capacité maximale (68–85 → +40 %)", () => {
    const r = calculerDevis({
      nb_passagers: CONFIG_PRICING.capacite_max,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100,
    });
    // facteur = 1.40 × 0.90 = 1.26 → 730.80 ; marge 109.62 → HT 840.42
    expect(r.prix_ht).toBe(840.42);
  });
});

describe("calculerDevis — options", () => {
  it("ajoute guide + nuit chauffeur", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100, // 580 → ajusté 522
      options: [
        { type: "guide", quantite: 2 }, // 160
        { type: "nuit_chauffeur", quantite: 1 }, // 120
      ],
    });
    // sous-total = 522 + 280 = 802 ; marge 120.30 → HT 922.30
    expect(r.prix_ht).toBe(922.3);
    expect(r.lignes.some((l) => l.libelle.includes("Guide"))).toBe(true);
    expect(r.lignes.some((l) => l.libelle.includes("Nuit chauffeur"))).toBe(
      true,
    );
  });

  it("accepte un forfait péages", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 100,
      options: [{ type: "peages", montant: 45 }],
    });
    expect(r.lignes.some((l) => l.libelle.includes("Péages"))).toBe(true);
  });
});

describe("calculerDevis — invariants", () => {
  it("est déterministe (deux appels identiques → résultat identique)", () => {
    const p = {
      nb_passagers: 40,
      date_depart: "2026-07-01",
      date_demande: "2026-05-01",
      distance_km: 120,
    };
    expect(calculerDevis(p)).toEqual(calculerDevis(p));
  });

  it("retourne toujours EUR + lignes détaillées", () => {
    const r = calculerDevis({
      nb_passagers: 25,
      date_depart: "2026-09-15",
      date_demande: "2026-03-15",
      distance_km: 80,
    });
    expect(r.devise).toBe("EUR");
    expect(r.lignes.length).toBeGreaterThan(0);
    expect(r.coefficients.length).toBeGreaterThan(0);
  });
});

describe("calculerDevis — cas limites", () => {
  it("rejette 0 passager", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 0,
        date_depart: "2026-09-15",
        distance_km: 100,
      }),
    ).toThrow(/passagers/i);
  });

  it("rejette > 85 passagers (escalade humain)", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 90,
        date_depart: "2026-09-15",
        distance_km: 100,
      }),
    ).toThrow(/capacité/i);
  });

  it("rejette une distance nulle", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "2026-09-15",
        distance_km: 0,
      }),
    ).toThrow(/distance/i);
  });

  it("rejette une date de départ antérieure à la demande", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "2026-01-01",
        date_demande: "2026-06-01",
        distance_km: 100,
      }),
    ).toThrow(/incohérente/i);
  });

  it("rejette une date de départ invalide", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "pas-une-date",
        distance_km: 100,
      }),
    ).toThrow(/date de départ/i);
  });

  it("exige un montant pour l'option péages", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "2026-09-15",
        date_demande: "2026-03-15",
        distance_km: 100,
        options: [{ type: "peages" }],
      }),
    ).toThrow(/péages/i);
  });
});
