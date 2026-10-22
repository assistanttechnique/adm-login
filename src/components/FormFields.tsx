import type { ReactNode } from 'react'

import { HelpTip } from './HelpTip'
import { LABEL_CLASS } from './formStyles'

// Case à cocher avec libellé et pastille d'aide facultative
export function Checkbox({ id, label, help, checked, onChange }: {
  id: string
  label: string
  help?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 cursor-pointer rounded-sm accent-night-950"
      />
      <label htmlFor={id} className="cursor-pointer text-[15px] text-black">
        {label}
      </label>
      {help && <HelpTip text={help} />}
    </div>
  )
}

// Boutons Cancel / validation en bas des formulaires en fenêtre modale
export function ModalActions({ submitLabel, onCancel }: { submitLabel: string; onCancel: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onCancel} className="rounded-md border border-card-border px-4 py-2 text-sm text-ink transition hover:bg-content">
        Cancel
      </button>
      <button type="submit" className="rounded-md bg-night-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800">
        {submitLabel}
      </button>
    </div>
  )
}

// Libellé d'une liste déroulante (Select / MultiSelect) : son id est `${id}-label`
export function SelectField({ id, label, help, children }: { id: string; label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <p id={`${id}-label`} className={`${LABEL_CLASS} flex items-center gap-2`}>
        {label}
        {help && <HelpTip text={help} />}
      </p>
      {children}
    </div>
  )
}
