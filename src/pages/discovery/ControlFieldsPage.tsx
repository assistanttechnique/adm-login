import { Layers } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { ModalActions } from '../../components/FormFields'
import { ColumnFilter, ListHeader, RowActions, StatusMessage } from '../../components/ListPage'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { DARK_BUTTON_CLASS, MODAL_FIELD_CLASS, MODAL_LABEL_CLASS } from '../../components/formStyles'
import { regexError } from '../../utils/regex'
import { ENABLED_FILTERS, matchesEnabledFilter, type ControlField } from './controlRulesData'
import { RegexTester } from './RegexTester'
import { useDiscoveryRules } from './useDiscoveryRules'

const PAGE_SIZE = 10
const CELL = 'px-3 py-3 align-middle'

type FieldInput = Omit<ControlField, 'id'>
type DialogState = { mode: 'create' } | { mode: 'edit'; field: ControlField } | null

const EMPTY_FIELD: FieldInput = { name: '', regularExpression: '', enabled: true }

function ControlFieldForm({ initial, existingNames, submitLabel, onSubmit, onCancel }: {
  initial: FieldInput
  existingNames: string[]
  submitLabel: string
  onSubmit: (values: FieldInput) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<FieldInput>(initial)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FieldInput>(field: K, value: FieldInput[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = values.name.trim()
    const pattern = values.regularExpression.trim()
    if (!name) return setError('Field Name is required.')
    if (existingNames.includes(name.toLowerCase())) return setError('A control field with this name already exists.')
    if (!pattern) return setError('Regular Expression is required.')
    const invalid = regexError(pattern)
    if (invalid) return setError(`Invalid regular expression: ${invalid}`)
    onSubmit({ ...values, name, regularExpression: pattern })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="control-field-name" className={MODAL_LABEL_CLASS}>
          Field Name <span className="text-form-required">*</span>
        </label>
        <input id="control-field-name" value={values.name} onChange={(e) => update('name', e.target.value)} className={MODAL_FIELD_CLASS} autoFocus />
      </div>
      <div>
        <label htmlFor="control-field-regex" className={MODAL_LABEL_CLASS}>
          Regular Expression <span className="text-form-required">*</span>
        </label>
        <input
          id="control-field-regex"
          value={values.regularExpression}
          onChange={(e) => update('regularExpression', e.target.value)}
          placeholder=".*(first|fname|firstname).*$"
          className={`${MODAL_FIELD_CLASS} font-mono`}
        />
        <p className="mt-1 text-xs text-muted">Applied to column names during the discovery scan (case-insensitive).</p>
      </div>
      <RegexTester id="control-field-test" pattern={values.regularExpression} placeholder="Column name, e.g. customer_fname" />
      <label className="flex items-center gap-2 text-sm text-black">
        <input type="checkbox" checked={values.enabled} onChange={(e) => update('enabled', e.target.checked)} className="size-4 accent-night-950" />
        Enabled
      </label>
      {error && (
        <p role="alert" className="text-sm text-form-error">
          {error}
        </p>
      )}
      <ModalActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  )
}

export default function ControlFieldsPage() {
  const { controlFields, createControlField, updateControlField, deleteControlFields } = useDiscoveryRules()
  const [enabledFilter, setEnabledFilter] = useState('Show All')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [toDelete, setToDelete] = useState<ControlField | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = controlFields.filter((f) => matchesEnabledFilter(f.enabled, enabledFilter))
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Noms déjà pris (hors élément modifié) pour garantir l'unicité
  const namesExcept = (id?: number) => controlFields.filter((f) => f.id !== id).map((f) => f.name.toLowerCase())

  function handleSave(values: FieldInput) {
    if (dialog?.mode === 'edit') {
      updateControlField(dialog.field.id, values)
      setFeedback(`Control field "${values.name}" updated.`)
    } else {
      createControlField(values)
      setFeedback(`Control field "${values.name}" created.`)
    }
    setDialog(null)
  }

  function confirmDelete() {
    if (!toDelete) return
    deleteControlFields([toDelete.id])
    setFeedback(`Control field "${toDelete.name}" deleted.`)
    setToDelete(null)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={Layers} title="Control Field List">
        <button type="button" onClick={() => setDialog({ mode: 'create' })} className={DARK_BUTTON_CLASS}>
          Create Control Field
        </button>
      </ListHeader>

      {feedback && <StatusMessage>{feedback}</StatusMessage>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="px-3 py-3 align-top font-semibold">Field Name</th>
              <th className="px-3 py-3 align-top font-semibold">Regular Expression</th>
              <th className="w-32 px-3 py-3 align-top font-semibold">
                Is Enabled
                <ColumnFilter label="Filter by enabled state" value={enabledFilter} options={ENABLED_FILTERS} onChange={setEnabledFilter} />
              </th>
              <th className="w-24 px-3 py-3 align-top font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((field) => (
              <tr key={field.id} className="border-b border-card-border">
                <td className={CELL}>
                  <button type="button" onClick={() => setDialog({ mode: 'edit', field })} className="font-medium text-accent-600 hover:underline">
                    {field.name}
                  </button>
                </td>
                <td className={`${CELL} font-mono text-xs`}>{field.regularExpression}</td>
                <td className={CELL}>{field.enabled ? 'Yes' : 'No'}</td>
                <td className={CELL}>
                  <RowActions label={field.name} onEdit={() => setDialog({ mode: 'edit', field })} onDelete={() => setToDelete(field)} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  No control field found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 mb-2">
        <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
      </div>

      {dialog && (
        <Modal title={dialog.mode === 'edit' ? 'Edit Control Field' : 'Create Control Field'} onClose={() => setDialog(null)}>
          <ControlFieldForm
            initial={dialog.mode === 'edit' ? dialog.field : EMPTY_FIELD}
            existingNames={namesExcept(dialog.mode === 'edit' ? dialog.field.id : undefined)}
            submitLabel={dialog.mode === 'edit' ? 'Update' : 'Create'}
            onSubmit={handleSave}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDeleteModal title="Delete Control Field" onConfirm={confirmDelete} onClose={() => setToDelete(null)}>
          <strong>{toDelete.name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
