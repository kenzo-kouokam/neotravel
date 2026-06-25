import type { Lead } from "@/src/types";

/**
 * Statut d'un lead dans le pipeline commercial.
 * Reflète les scénarios de démo du brief (devis envoyé, relancé, gagné…).
 */
export type StatutLead =
  | "a_traiter" // nouveau, pas encore qualifié
  | "qualifie" // champs complets, devis calculable
  | "devis_envoye" // proposition transmise au prospect
  | "relance" // relance automatique déclenchée
  | "gagne" // devis accepté
  | "perdu" // devis refusé / sans réponse
  | "escalade"; // cas complexe → intervention humaine requise

/** Raison d'une escalade vers un commercial humain (human-in-the-loop). */
export type RaisonEscalade =
  | "capacite_depassee" // > 85 passagers (flux manuel imposé par les règles)
  | "demande_atypique" // trajet hors zone / multi-étapes
  | "negociation"; // le prospect négocie le prix

export interface LeadCommercial extends Lead {
  id: string;
  statut: StatutLead;
  /** Score de complétude 0–100 (% de champs requis renseignés). */
  completude: number;
  /** Prix TTC du devis en €, si déjà calculé. */
  prixTtc?: number;
  /** Renseigné uniquement si statut = "escalade". */
  raisonEscalade?: RaisonEscalade;
  /** Date de création de la demande (ISO 8601). */
  creeLe: string;
  /** Nombre de relances déjà envoyées. */
  relances: number;
}

/**
 * Jeu de données de démonstration.
 * ⚠️ TEMPORAIRE — à remplacer par une lecture du CRM (Airtable) une fois
 * la base branchée. La structure ci-dessous mappe les colonnes attendues.
 */
export const LEADS_DEMO: LeadCommercial[] = [
  {
    id: "NEO-2041",
    nom: "Comité d'entreprise Atos",
    email: "ce@atos-demo.fr",
    depart: "Lyon",
    destination: "Annecy",
    dateDepart: "2026-07-18",
    nbPassagers: 92,
    statut: "escalade",
    raisonEscalade: "capacite_depassee",
    completude: 100,
    creeLe: "2026-06-25T08:12:00Z",
    relances: 0,
  },
  {
    id: "NEO-2040",
    nom: "Association Les Randonneurs",
    email: "contact@rando-demo.fr",
    depart: "Grenoble",
    destination: "Briançon — tour des Écrins (multi-étapes)",
    dateDepart: "2026-08-03",
    nbPassagers: 38,
    statut: "escalade",
    raisonEscalade: "demande_atypique",
    completude: 100,
    creeLe: "2026-06-25T07:45:00Z",
    relances: 0,
  },
  {
    id: "NEO-2039",
    nom: "Lycée Jean Moulin",
    email: "voyages@jeanmoulin-demo.fr",
    depart: "Lyon",
    destination: "Barcelone",
    dateDepart: "2026-07-14",
    nbPassagers: 45,
    statut: "devis_envoye",
    completude: 100,
    prixTtc: 2337.72,
    creeLe: "2026-06-24T16:30:00Z",
    relances: 0,
  },
  {
    id: "NEO-2038",
    nom: "Mariage Dubois",
    email: "p.dubois-demo@gmail.com",
    depart: "Dijon",
    destination: "Beaune",
    dateDepart: "2026-09-12",
    nbPassagers: 28,
    statut: "relance",
    completude: 100,
    prixTtc: 612.48,
    creeLe: "2026-06-22T11:00:00Z",
    relances: 1,
  },
  {
    id: "NEO-2037",
    nom: "Club sportif Villeurbanne",
    email: "secretariat@csv-demo.fr",
    depart: "Villeurbanne",
    destination: "—",
    dateDepart: undefined,
    nbPassagers: 22,
    statut: "a_traiter",
    completude: 50,
    creeLe: "2026-06-25T09:05:00Z",
    relances: 0,
  },
  {
    id: "NEO-2036",
    nom: "Séminaire BioTech",
    email: "events@biotech-demo.fr",
    depart: "Lyon",
    destination: "Genève",
    dateDepart: "2026-10-02",
    nbPassagers: 55,
    statut: "gagne",
    completude: 100,
    prixTtc: 1489.6,
    creeLe: "2026-06-20T14:20:00Z",
    relances: 1,
  },
  {
    id: "NEO-2035",
    nom: "Voyage scolaire Sainte-Marie",
    email: "direction@saintemarie-demo.fr",
    depart: "Saint-Étienne",
    destination: "Paris",
    dateDepart: "2026-06-29",
    nbPassagers: 48,
    statut: "perdu",
    completude: 100,
    prixTtc: 3120.0,
    creeLe: "2026-06-18T10:10:00Z",
    relances: 2,
  },
];
