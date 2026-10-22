import { ChevronDown, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { useDismiss } from '../hooks/useDismiss'

// Liste déroulante à choix multiple : les valeurs choisies s'affichent en étiquettes supprimables
export function MultiSelect({ id, labelId, values, options, placeholder = '', onChange }: {
  id: string
  labelId: string
  values: string[]
  options: string[]
  placeholder?: string
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(rootRef, open, close)

  const toggle = (option: string) =>
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option])

  return (
    <div ref={rootRef} className="relative">
      <div className="flex min-h-12 w-full items-center gap-2 rounded-md border-2 border-[#dcdce3] bg-white px-4 py-1 focus-within:border-lilac">
        {values.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Selected values">
            {values.map((value) => (
              <li key={value} className="flex items-center gap-2 rounded bg-[#ececee] px-3 py-1 text-[15px] font-medium text-[#8a8a8a]">
                {value}
                <button
                  type="button"
                  onClick={() => toggle(value)}
                  aria-label={`Remove ${value}`}
                  className="rounded-sm bg-[#8a8a8a] p-0.5 text-white transition hover:bg-night-950"
                >
                  <X className="size-2.5" strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          id={id}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${id}`}
          className="flex min-h-9 flex-1 items-center justify-between text-left text-[15px] text-[#a3a3a3] focus:outline-none"
        >
          <span>{values.length === 0 ? placeholder : ''}</span>
          <ChevronDown className={`size-4 shrink-0 text-black transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border-2 border-[#dcdce3] bg-white py-2 shadow-md"
        >
          {options.map((option) => {
            const selected = values.includes(option)
            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => toggle(option)}
                  className={`w-full px-4 py-2 text-left text-[15px] font-medium transition hover:text-lilac focus:text-lilac focus:outline-none ${
                    selected ? 'text-lilac' : 'text-[#9a9a9a]'
                  }`}
                >
                  {option}
                </button>
              </li>
            )
          })}
          {options.length === 0 && <li className="px-4 py-2 text-sm text-muted">No option available</li>}
        </ul>
      )}
    </div>
  )
}
