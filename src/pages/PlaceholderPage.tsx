import { Construction } from 'lucide-react'

// Page provisoire pour les entrées du menu pas encore développées
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl bg-white p-10 text-center shadow-card">
      <Construction className="size-10 text-lilac" strokeWidth={1.5} />
      <h1 className="text-[28px] leading-[38px] font-semibold text-black">{title}</h1>
      <p className="text-muted">This page is under construction.</p>
    </div>
  )
}
