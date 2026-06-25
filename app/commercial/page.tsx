"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LEADS_DEMO,
  type LeadCommercial,
  type StatutLead,
  type RaisonEscalade,
} from "@/src/data/leads-demo";

const LIBELLE_STATUT: Record<StatutLead, string> = {
  a_traiter: "À traiter",
  qualifie: "Qualifié",
  devis_envoye: "Devis envoyé",
  relance: "Relancé",
  gagne: "Gagné",
  perdu: "Perdu",
  escalade: "Escalade humaine",
};

const STYLE_STATUT: Record<StatutLead, string> = {
  a_traiter: "bg-zinc-100 text-zinc-700",
  qualifie: "bg-sky-100 text-sky-800",
  devis_envoye: "bg-amber-100 text-amber-800",
  relance: "bg-orange-100 text-orange-800",
  gagne: "bg-emerald-100 text-emerald-800",
  perdu: "bg-zinc-200 text-zinc-500",
  escalade: "bg-red-100 text-red-800",
};

const LIBELLE_ESCALADE: Record<RaisonEscalade, string> = {
  capacite_depassee: "Capacité > 85 passagers (flux manuel)",
  demande_atypique: "Demande atypique / multi-étapes",
  negociation: "Négociation tarifaire en cours",
};

function formatPrix(p?: number) {
  if (p == null) return "—";
  return p.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export default function CommercialPage() {
  const [leads, setLeads] = useState<LeadCommercial[]>(LEADS_DEMO);

  const escalades = leads.filter((l) => l.statut === "escalade");

  const kpis = useMemo(() => {
    const total = leads.length;
    const gagnes = leads.filter((l) => l.statut === "gagne").length;
    const traitables = leads.filter(
      (l) => l.statut !== "a_traiter",
    ).length;
    const enAttente = leads.filter(
      (l) => l.statut === "devis_envoye" || l.statut === "relance",
    ).length;
    const tauxTransfo = traitables
      ? Math.round((gagnes / traitables) * 100)
      : 0;
    return {
      aTraiter: leads.filter((l) => l.statut === "a_traiter").length,
      enAttente,
      escalades: leads.filter((l) => l.statut === "escalade").length,
      tauxTransfo,
      total,
    };
  }, [leads]);

  function prendreEnCharge(id: string) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, statut: "qualifie" } : l,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="border-b border-[color:var(--brand-ember)]/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="cta-sunset flex h-9 w-9 items-center justify-center rounded-lg text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6v6" />
                <path d="M16 6v6" />
                <path d="M2 12h19.6a.5.5 0 0 1 .4.8l-1.5 2c-.3.4-.7.6-1.2.6H4a2 2 0 0 1-2-2Z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="18" cy="17" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--brand-clay)]">
                Neotravel · Espace commercial
              </p>
              <p className="text-xs text-zinc-500">
                Pipeline & reprise humaine
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--brand-clay)]/30 px-4 py-1.5 text-sm text-[color:var(--brand-clay)] hover:bg-[color:var(--brand-clay)]/5"
          >
            ← Landing
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="À traiter"
            value={kpis.aTraiter}
            hint="nouvelles demandes"
            accent="text-zinc-700"
          />
          <KpiCard
            label="Devis en attente"
            value={kpis.enAttente}
            hint="envoyés ou relancés"
            accent="text-amber-700"
          />
          <KpiCard
            label="À escalader"
            value={kpis.escalades}
            hint="intervention humaine"
            accent="text-red-700"
          />
          <KpiCard
            label="Taux de transfo"
            value={`${kpis.tauxTransfo}%`}
            hint="devis → gagnés"
            accent="text-emerald-700"
          />
        </section>

        {/* Section escalade — human-in-the-loop */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </span>
            <h2 className="text-lg font-semibold text-[color:var(--brand-clay)]">
              À traiter en priorité — reprise humaine
            </h2>
          </div>

          {escalades.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-white/60 px-4 py-6 text-center text-sm text-zinc-500">
              Aucun cas à escalader. L'agent traite tout automatiquement 🎉
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {escalades.map((l) => (
                <article
                  key={l.id}
                  className="rounded-2xl border border-red-200 bg-red-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[color:var(--brand-clay)]">
                        {l.nom}
                      </p>
                      <p className="text-sm text-zinc-600">
                        {l.depart} → {l.destination}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-500">
                      {l.id}
                    </span>
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                    {l.raisonEscalade
                      ? LIBELLE_ESCALADE[l.raisonEscalade]
                      : "Cas complexe"}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-600">
                      {l.nbPassagers} passagers · départ{" "}
                      {formatDate(l.dateDepart)}
                    </span>
                    <button
                      onClick={() => prendreEnCharge(l.id)}
                      className="cta-sunset rounded-full px-3.5 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105"
                    >
                      Prendre en charge
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pipeline complet */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--brand-clay)]">
            Pipeline commercial
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[color:var(--brand-ember)]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-[color:var(--brand-sand)]/40 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Réf.</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Trajet</th>
                  <th className="px-4 py-3 font-medium">Pax</th>
                  <th className="px-4 py-3 font-medium">Devis</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Créé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    className="transition-colors hover:bg-[color:var(--brand-sand)]/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {l.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">
                      {l.nom}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {l.depart} → {l.destination}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {l.nbPassagers ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-800">
                      {formatPrix(l.prixTtc)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STYLE_STATUT[l.statut]}`}
                      >
                        {LIBELLE_STATUT[l.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {formatDate(l.creeLe)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Données de démonstration — à brancher sur le CRM Airtable (table{" "}
            <span className="font-mono">Demandes</span>).
          </p>
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--brand-ember)]/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}
