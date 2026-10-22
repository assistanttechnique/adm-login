import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function DashboardCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-md border border-card-border bg-white">
      <header className="flex items-center gap-2.5 rounded-t-md bg-night-950 px-4 py-4 text-white">
        <Icon className="size-5 shrink-0" strokeWidth={1.75} />
        <h2 className="text-[15px] font-bold tracking-tight uppercase">{title}</h2>
      </header>
      <div className="flex min-h-[172px] flex-1 flex-col justify-center p-6">{children}</div>
    </section>
  )
}

// Indicateur centré : libellé + grande valeur (Server Load, Server Status…)
export function StatValue({ label, value }: { label?: string; value: string }) {
  return (
    <div className="text-center">
      {label && <p className="text-[15px] text-black">{label}</p>}
      <p className="text-[32px] leading-tight font-bold text-black">{value}</p>
    </div>
  )
}
