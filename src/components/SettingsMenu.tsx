import { ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { useDismiss } from '../hooks/useDismiss'

export interface SettingsMenuItem {
  label: string
  onClick: () => void
  disabled?: boolean
}

// Bouton « Settings ▾ » des listes (projets, assessments…) avec ses actions groupées
export function SettingsMenu({ items }: { items: SettingsMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(menuRef, open, close)

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-card-border bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-content"
      >
        Settings
        <ChevronDown className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-md border border-card-border bg-white py-1 shadow-lg">
          {items.map(({ label, onClick, disabled }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false)
                onClick()
              }}
              className="block w-full px-4 py-2 text-left text-xs text-ink transition hover:bg-content disabled:cursor-not-allowed disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
