// Pastille « ? » : affiche le texte d'aide au survol ou au focus clavier
export function HelpTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        tabIndex={0}
        aria-label={text}
        className="inline-flex size-[18px] cursor-help items-center justify-center rounded-full bg-night-950 text-[11px] font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
      >
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 rounded-md bg-night-950 px-3 py-2 text-xs font-normal text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  )
}
