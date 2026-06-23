import Chatbot from "./components/Chatbot";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-white/15 dark:text-zinc-400">
            Transport de groupe en autocar
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Votre devis transport de groupe, en quelques minutes.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Décrivez votre déplacement à notre assistant Neotravel : départ,
            destination, dates et nombre de passagers. Nous vous préparons un
            devis personnalisé.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✓ Réponse immédiate</li>
            <li>✓ Devis sans engagement</li>
            <li>✓ Autocars adaptés à tous les groupes</li>
          </ul>
        </div>

        <Chatbot />
      </main>
    </div>
  );
}
