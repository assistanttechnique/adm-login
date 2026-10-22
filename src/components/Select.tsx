import { ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { useDismiss } from '../hooks/useDismiss'

// Liste déroulante stylée comme la maquette ADM (options grises, survol lilas)
export function Select({ id, labelId, value, options, placeholder = '', disabled = false, onChange }: {
  id: string
  labelId: string
  value: string
  options: string[]
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(rootRef, open, close)

  function select(option: string) {
    onChange(option)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${id}`}
        className="flex h-12 w-full items-center justify-between rounded-md border-2 border-[#dcdce3] bg-white px-4 text-left text-[15px] font-medium transition focus:border-lilac focus:outline-none disabled:cursor-not-allowed disabled:bg-content disabled:opacity-60"
      >
        <span className={value ? 'text-[#7a7a7a]' : 'text-[#a3a3a3]'}>{value || placeholder}</span>
        <ChevronDown className={`size-4 text-black transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border-2 border-[#dcdce3] bg-white py-2 shadow-md"
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onClick={() => select(option)}
                className={`w-full px-4 py-2 text-left text-[15px] font-medium transition hover:text-lilac focus:text-lilac focus:outline-none ${
                  option === value ? 'text-lilac' : 'text-[#9a9a9a]'
                }`}
              >
                {option}
              </button>
            </li>
          ))}
          {options.length === 0 && <li className="px-4 py-2 text-sm text-muted">No option available</li>}
        </ul>
      )}
    </div>
  )
}
