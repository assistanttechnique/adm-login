import type { LucideIcon } from 'lucide-react'
import { SquarePen, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

// Briques communes des pages de liste ADM (titre + actions, actions de ligne, filtres, messages)

export function ListHeader({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex items-center gap-2.5 text-[15px] font-bold text-black">
        <Icon className="size-7 text-night-950" strokeWidth={1.5} />
        {title}
      </h1>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

// Sans `onDelete`, seul le bouton de modification est affiché
export function RowActions({ label, onEdit, onDelete }: { label: string; onEdit: () => void; onDelete?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onEdit} aria-label={`Edit ${label}`} className="rounded p-0.5 text-night-950 transition hover:text-lilac">
        <SquarePen className="size-4" />
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label={`Delete ${label}`} className="rounded p-0.5 text-night-950 transition hover:text-form-error">
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  )
}

// Filtre compact placé sous un en-tête de colonne (« Show All », « Yes », « No »…)
export function ColumnFilter({ label, value, options, onChange }: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 block w-full rounded-sm border-0 bg-white px-1.5 py-0.5 text-xs font-normal text-black outline-none focus:ring-2 focus:ring-lilac"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

export function StatusMessage({ type = 'success', children }: { type?: 'success' | 'error'; children: ReactNode }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`mt-4 rounded-md px-4 py-2.5 text-sm ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}
    >
      {children}
    </div>
  )
}
