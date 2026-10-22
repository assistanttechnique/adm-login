import { useState, type FormEvent } from 'react'

import { CONNECTION_TYPES, type ConnectionInput } from './connectionsData'

const FIELD_CLASS =
  'w-full rounded-md border border-card-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-lilac focus:ring-2 focus:ring-lilac/25'
const LABEL_CLASS = 'mb-1 block text-xs font-semibold text-black'

const EMPTY_CONNECTION: ConnectionInput = {
  name: '',
  type: 'Relational',
  subType: CONNECTION_TYPES.Relational[0],
  fileShare: '',
  description: '',
}

export function ConnectionForm({ initial, submitLabel, onSubmit, onCancel }: {
  initial?: ConnectionInput
  submitLabel: string
  onSubmit: (values: ConnectionInput) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<ConnectionInput>(initial ?? EMPTY_CONNECTION)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof ConnectionInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    if (field === 'name') setError(null)
  }

  function handleTypeChange(type: string) {
    // Le sous-type dépend du type : on reprend le premier sous-type disponible
    setValues((v) => ({ ...v, type, subType: CONNECTION_TYPES[type][0] }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.name.trim()) {
      setError('Connection Name is required.')
      return
    }
    onSubmit({ ...values, name: values.name.trim(), fileShare: values.fileShare.trim(), description: values.description.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="connection-name" className={LABEL_CLASS}>
          Connection Name <span className="text-form-required">*</span>
        </label>
        <input
          id="connection-name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          className={FIELD_CLASS}
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="connection-type" className={LABEL_CLASS}>
            Connection Type
          </label>
          <select id="connection-type" value={values.type} onChange={(e) => handleTypeChange(e.target.value)} className={FIELD_CLASS}>
            {Object.keys(CONNECTION_TYPES).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="connection-subtype" className={LABEL_CLASS}>
            Sub Type
          </label>
          <select id="connection-subtype" value={values.subType} onChange={(e) => update('subType', e.target.value)} className={FIELD_CLASS}>
            {CONNECTION_TYPES[values.type].map((subType) => (
              <option key={subType}>{subType}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="connection-fileshare" className={LABEL_CLASS}>
          File Share
        </label>
        <input id="connection-fileshare" value={values.fileShare} onChange={(e) => update('fileShare', e.target.value)} className={FIELD_CLASS} />
      </div>

      <div>
        <label htmlFor="connection-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="connection-description"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${FIELD_CLASS} resize-y`}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-form-error">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-md border border-card-border px-4 py-2 text-sm text-ink transition hover:bg-content">
          Cancel
        </button>
        <button type="submit" className="rounded-md bg-night-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
