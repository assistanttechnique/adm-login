// Informations affichées en bas de page (reprises de la maquette)
const APP_INFO = {
  copyright: 'Copyright 2024 Accutive',
  version: 'Version 2022/4 GA p1 (build 7.6.68)',
  // TODO : alimenter avec l'état réel du programme en cours quand l'API existera
  status: 'Elapsed Time-00:00:00 Program - 0% Time Remaining - 00:00:00',
}

export function AdminFooter() {
  return (
    <footer className="flex shrink-0 flex-col gap-2 bg-[#e9e9eb] px-4 py-2.5 text-xs font-bold text-black sm:flex-row sm:items-end sm:justify-between lg:px-11">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <div>
          <p className="text-[11px] leading-tight">Powered by</p>
          {/* Logo Accutive teinté en dégradé vert-turquoise via un masque CSS */}
          <span
            role="img"
            aria-label="Accutive"
            className="block h-6 w-[77px] bg-linear-to-r from-[#3fd15e] to-[#1fb5a8] [mask-image:url(/accutive-logo.png)] [mask-size:contain] [mask-repeat:no-repeat]"
          />
        </div>
        <p>
          {APP_INFO.copyright} | {APP_INFO.version}
        </p>
      </div>
      <p>{APP_INFO.status}</p>
    </footer>
  )
}
