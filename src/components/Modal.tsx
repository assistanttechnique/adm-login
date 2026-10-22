import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function Modal({ title, onClose, size = 'md', children }: {
  title: string
  onClose: () => void
  size?: 'md' | 'lg'
  children: ReactNode
}) {
  // Fermeture avec la touche Échap
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <header className="flex shrink-0 items-center justify-between bg-night-950 px-5 py-3.5 text-white">
          <h2 className="text-sm font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded p-1 transition hover:bg-white/10">
            <X className="size-4" />
          </button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
