import { describe, it, expect } from "vitest";
import { calculerDevis, CONFIG_PRICING } from "./calculer-devis";

/**
 * Golden set du moteur de tarification.
 * Couvre les cas types ET les cas limites (cf. brief — § pricing).
 */

describe("calculerDevis — cas types", () => {
  it("calcule un devis simple complet (déterministe)", () => {
    const r = calculerDevis({
      nb_passagers: 45, // tranche 20–53 → 0 %
      date_depart: "2026-09-15", // septembre → Moyenne (0 %)
      date_demande: "2026-03-15", // ~184 j → DD_3MOISETPLUS (-10 %)
      distance_km: 400,
    });

    // base = max(400 × 2.5, 250) = 1000
    // facteur = (1+0)(1-0.10)(1+0) = 0.9 → baseAjustee = 900
    // marge = 900 × 0.15 = 135 → HT = 1035
    // TVA = 103.5 → TTC = 1138.5
    expect(r.prix_ht).toBe(1035);
    expect(r.tva).toBe(103.5);
    expect(r.prix_ttc).toBe(1138.5);
    expect(r.devise).toBe("EUR");
  });

  it("applique le prix minimum sur les courtes distances", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-10",
      date_demande: "2026-04-10", // > 90 j → -10 %
      distance_km: 50, // 50 × 2.5 = 125 < plancher 250 → base = 250
    });
    // 250 × 0.9 = 225 ; marge 33.75 → HT 258.75
    expect(r.prix_ht).toBe(258.75);
  });

  it("applique la majoration très haute saison (juin +15 %)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-06-20",
      date_demande: "2026-01-20", // > 90 j → -10 %
      distance_km: 400, // base 1000
    });
    // facteur = 1.15 × 0.90 = 1.035 → 1035 ; marge 155.25 → HT 1190.25
    expect(r.prix_ht).toBe(1190.25);
  });

  it("ajoute les options (guide + nuit chauffeur)", () => {
    const r = calculerDevis({
      nb_passagers: 30,
      date_depart: "2026-09-10",
      date_demande: "2026-04-10",
      distance_km: 400, // base 1000 → ajustée 900
      options: [
        { type: "guide", quantite: 2 }, // 160
        { type: "nuit_chauffeur", quantite: 1 }, // 120
      ],
    });
    // sous-total = 900 + 280 = 1180 ; marge 177 → HT 1357
    expect(r.prix_ht).toBe(1357);
    expect(r.lignes.some((l) => l.libelle.includes("Guide"))).toBe(true);
    expect(r.lignes.some((l) => l.libelle.includes("Nuit chauffeur"))).toBe(
      true,
    );
  });

  it("majore la capacité (54–63 passagers → +15 %)", () => {
    const r = calculerDevis({
      nb_passagers: 60,
      date_depart: "2026-09-10",
      date_demande: "2026-04-10", // -10 %
      distance_km: 400, // base 1000
    });
    // facteur = 1.15 × 0.90 = 1.035 → 1035 ; marge 155.25 → HT 1190.25
    expect(r.prix_ht).toBe(1190.25);
  });

  it("est déterministe (deux appels identiques → résultat identique)", () => {
    const p = {
      nb_passagers: 40,
      date_depart: "2026-07-01",
      date_demande: "2026-05-01",
      distance_km: 320,
    };
    expect(calculerDevis(p)).toEqual(calculerDevis(p));
  });

  it("retourne toujours la devise EUR et des lignes détaillées", () => {
    const r = calculerDevis({
      nb_passagers: 25,
      date_depart: "2026-09-10",
      date_demande: "2026-04-10",
      distance_km: 200,
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
        date_depart: "2026-09-10",
        distance_km: 400,
      }),
    ).toThrow(/passagers/i);
  });

  it("rejette un dépassement de capacité (> 85)", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 90,
        date_depart: "2026-09-10",
        distance_km: 400,
      }),
    ).toThrow(/capacité/i);
  });

  it("rejette une distance nulle ou négative", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "2026-09-10",
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
        distance_km: 400,
      }),
    ).toThrow(/incohérente/i);
  });

  it("rejette une date de départ invalide", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "pas-une-date",
        distance_km: 400,
      }),
    ).toThrow(/date de départ/i);
  });

  it("exige un montant pour l'option péages", () => {
    expect(() =>
      calculerDevis({
        nb_passagers: 30,
        date_depart: "2026-09-10",
        date_demande: "2026-04-10",
        distance_km: 400,
        options: [{ type: "peages" }],
      }),
    ).toThrow(/péages/i);
  });

  it("accepte la capacité maximale exacte (85)", () => {
    const r = calculerDevis({
      nb_passagers: CONFIG_PRICING.capacite_max,
      date_depart: "2026-09-10",
      date_demande: "2026-04-10",
      distance_km: 400,
    });
    // facteur = (1+0.40) × 0.90 = 1.26 → 1260 ; marge 189 → HT 1449
    expect(r.prix_ht).toBe(1449);
  });
});
