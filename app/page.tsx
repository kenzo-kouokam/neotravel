import Chatbot from "./components/Chatbot";

export default function Home() {
  return (
    <div className="hero-bg relative flex flex-1 flex-col overflow-hidden">
      {/* Décor géométrique fond */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Cercle ambre droit */}
        <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-[color:var(--brand-ember)]/[0.06]" />
        {/* Cercle clay bas gauche */}
        <div className="absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-[color:var(--brand-clay)]/[0.05]" />
        {/* Trait diagonal discret */}
        <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03]" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="600" y1="0" x2="0" y2="800" stroke="#7c2d12" strokeWidth="120" />
        </svg>
        {/* Grille de points */}
        <svg className="absolute left-8 top-24 opacity-[0.07]" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 6 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={col * 32 + 8} cy={row * 32 + 8} r="2" fill="#d97706" />
            ))
          )}
        </svg>
      </div>

      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
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
              <path d="M14 17h2.5" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="18" cy="17" r="2" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[color:var(--brand-clay)]">
            Neotravel
          </span>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-zinc-700 sm:flex">
          <a href="#" className="hover:text-[color:var(--brand-clay)]">
            Destinations
          </a>
          <a href="#" className="hover:text-[color:var(--brand-clay)]">
            Notre flotte
          </a>
          <a href="#" className="hover:text-[color:var(--brand-clay)]">
            Avis clients
          </a>
          <a
            href="#"
            className="rounded-full border border-[color:var(--brand-clay)]/30 px-4 py-1.5 text-[color:var(--brand-clay)] hover:bg-[color:var(--brand-clay)]/5"
          >
            Nous appeler
          </a>
        </nav>
      </header>

      {/* Hero + chatbot */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-12 px-6 pb-16 pt-8 lg:flex-row lg:items-start lg:gap-16 lg:pt-16">
        {/* Colonne gauche : pitch */}
        <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[color:var(--brand-clay)] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand-ember)]" />
            Transport de groupe en autocar — depuis 2010
          </span>

          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-[color:var(--foreground)] sm:text-5xl lg:text-6xl">
            Partez à plusieurs,{" "}
            <span className="bg-gradient-to-br from-[color:var(--brand-ember)] to-[color:var(--brand-clay)] bg-clip-text text-transparent">
              voyagez l'esprit léger.
            </span>
          </h1>

          <p className="max-w-md text-lg leading-7 text-zinc-700">
            Décrivez votre projet à notre assistant : départ, destination, dates,
            nombre de passagers. Nous préparons votre devis personnalisé en
            quelques minutes.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[color:var(--brand-ember)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              Réponse immédiate
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[color:var(--brand-ember)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.5-3 8-7 8-11.5A8 8 0 0 0 4 10.5C4 15 6.5 19 12 22Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              France & Europe
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-[color:var(--brand-ember)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 7 9 18l-5-5" />
              </svg>
              Devis sans engagement
            </div>
          </div>

          {/* Badges confiance */}
          <div className="mt-2 flex items-center gap-5 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-[color:var(--brand-ember)] text-[color:var(--brand-ember)]"
                  >
                    <path d="M12 17.3 6.18 21l1.55-6.65L2.5 9.74l6.83-.55L12 3l2.67 6.19 6.83.55-5.23 4.61L17.82 21Z" />
                  </svg>
                ))}
              </div>
              <span className="font-medium">4,9/5</span>
              <span>· 850+ avis</span>
            </div>
            <span className="hidden h-3 w-px bg-zinc-300 sm:block" />
            <span className="hidden sm:inline">15 000+ voyages organisés</span>
          </div>
        </div>

        {/* Colonne droite : chatbot — pièce maîtresse */}
        <div className="w-full max-w-md">
          <Chatbot />
        </div>
      </main>

      {/* Bandeau destinations */}
      <section className="border-t border-[color:var(--brand-ember)]/10 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-5 text-sm text-zinc-600">
          <span className="font-medium text-[color:var(--brand-clay)]">
            Destinations populaires :
          </span>
          <span>Paris</span>
          <span>·</span>
          <span>Barcelone</span>
          <span>·</span>
          <span>Amsterdam</span>
          <span>·</span>
          <span>Rome</span>
          <span>·</span>
          <span>Berlin</span>
          <span>·</span>
          <span>Côte d'Azur</span>
          <span>·</span>
          <span>Alpes</span>
        </div>
      </section>
    </div>
  );
}
