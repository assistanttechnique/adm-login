import { useState } from 'react'

export interface DualListOption {
  id: number
  label: string
}

const BOX_CLASS = 'h-72 overflow-y-auto rounded-md border-2 border-[#dcdce3] bg-white py-1'
const BUTTON_CLASS =
  'w-full rounded-md border border-night-950 px-3 py-2 text-sm font-semibold text-night-950 transition hover:bg-content disabled:cursor-not-allowed disabled:opacity-40'

function OptionList({ title, options, highlighted, onToggle }: {
  title: string
  options: DualListOption[]
  highlighted: number[]
  onToggle: (id: number) => void
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-sm font-semibold text-black">{title}</p>
      <ul role="listbox" aria-label={title} aria-multiselectable="true" className={BOX_CLASS}>
        {options.map(({ id, label }) => {
          const active = highlighted.includes(id)
          return (
            <li key={id} role="option" aria-selected={active}>
              <button
                type="button"
                onClick={() => onToggle(id)}
                className={`w-full truncate px-3 py-1.5 text-left text-sm transition ${
                  active ? 'bg-lilac/20 font-semibold text-accent-600' : 'text-ink hover:bg-content'
                }`}
              >
                {label}
              </button>
            </li>
          )
        })}
        {options.length === 0 && <li className="px-3 py-2 text-sm text-muted">—</li>}
      </ul>
    </div>
  )
}

// Double liste « disponibles ↔ sélectionnés » avec Add / Remove / Add All / Remove All
export function DualListBox({ name, options, selected, onChange }: {
  name: string
  options: DualListOption[]
  selected: number[]
  onChange: (selected: number[]) => void
}) {
  const [highlightAvailable, setHighlightAvailable] = useState<number[]>([])
  const [highlightSelected, setHighlightSelected] = useState<number[]>([])

  const available = options.filter((o) => !selected.includes(o.id))
  const chosen = options.filter((o) => selected.includes(o.id))
  const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  function add(ids: number[]) {
    onChange([...selected, ...ids.filter((id) => !selected.includes(id))])
    setHighlightAvailable([])
  }

  function remove(ids: number[]) {
    onChange(selected.filter((id) => !ids.includes(id)))
    setHighlightSelected([])
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <OptionList
        title={`Available ${name}`}
        options={available}
        highlighted={highlightAvailable}
        onToggle={(id) => setHighlightAvailable((list) => toggle(list, id))}
      />
      <div className="flex shrink-0 flex-row gap-2 md:w-36 md:flex-col">
        <button type="button" onClick={() => add(highlightAvailable)} disabled={highlightAvailable.length === 0} className={BUTTON_CLASS}>
          Add
        </button>
        <button type="button" onClick={() => remove(highlightSelected)} disabled={highlightSelected.length === 0} className={BUTTON_CLASS}>
          Remove
        </button>
        <button type="button" onClick={() => add(available.map((o) => o.id))} disabled={available.length === 0} className={BUTTON_CLASS}>
          Add All
        </button>
        <button type="button" onClick={() => remove(selected)} disabled={chosen.length === 0} className={BUTTON_CLASS}>
          Remove All
        </button>
      </div>
      <OptionList
        title={`Selected ${name}`}
        options={chosen}
        highlighted={highlightSelected}
        onToggle={(id) => setHighlightSelected((list) => toggle(list, id))}
      />
    </div>
  )
}
