import { BrainCog } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { ModalActions } from '../../components/FormFields'
import { ColumnFilter, ListHeader, RowActions, StatusMessage } from '../../components/ListPage'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { DARK_BUTTON_CLASS, MODAL_FIELD_CLASS, MODAL_LABEL_CLASS } from '../../components/formStyles'
import { regexError } from '../../utils/regex'
import {
  DATA_TYPES,
  ENABLED_FILTERS,
  MASKING_OPERATORS,
  SCAN_TYPES,
  matchesEnabledFilter,
  type ControlValue,
  type ScanType,
} from './controlRulesData'
import { RegexTester } from './RegexTester'
import { useDiscoveryRules } from './useDiscoveryRules'

const PAGE_SIZE = 10
const CELL = 'px-3 py-3 align-middle'
const CODE_CLASS = `${MODAL_FIELD_CLASS} resize-y font-mono text-xs leading-5`

type ValueInput = Omit<ControlValue, 'id'>
type DialogState = { mode: 'create' } | { mode: 'edit'; value: ControlValue } | null

const EMPTY_VALUE: ValueInput = {
  name: '',
  enabled: true,
  scanType: 'REGEXP',
  regularExpression: '',
  groovyStaticScript: '',
  groovyScript: '',
  matchLimit: 30,
  allowedDataTypes: ['Literal'],
  maskingOperator: 'Template',
  defaultParameters: '',
}

// Règles de validation du formulaire ; renvoie le premier problème trouvé
function validate(values: ValueInput, existingNames: string[]): string | null {
  if (!values.name.trim()) return 'Field Name is required.'
  if (existingNames.includes(values.name.trim().toLowerCase())) return 'A control value with this name already exists.'
  if (values.scanType === 'REGEXP') {
    if (!values.regularExpression.trim()) return 'Regular Expression is required.'
    const invalid = regexError(values.regularExpression.trim())
    if (invalid) return `Invalid regular expression: ${invalid}`
  } else if (!values.groovyScript.trim()) {
    return 'Groovy Script is required.'
  }
  if (!Number.isInteger(values.matchLimit) || values.matchLimit < 1) return 'Match Limit must be a positive whole number.'
  if (values.allowedDataTypes.length === 0) return 'Select at least one allowed data type.'
  return null
}

function ControlValueForm({ initial, existingNames, submitLabel, onSubmit, onCancel }: {
  initial: ValueInput
  existingNames: string[]
  submitLabel: string
  onSubmit: (values: ValueInput) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<ValueInput>(initial)
  const [error, setError] = useState<string | null>(null)
  const isRegexp = values.scanType === 'REGEXP'

  function update<K extends keyof ValueInput>(field: K, value: ValueInput[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    setError(null)
  }

  const toggleDataType = (type: string) =>
    update(
      'allowedDataTypes',
      values.allowedDataTypes.includes(type) ? values.allowedDataTypes.filter((t) => t !== type) : [...values.allowedDataTypes, type],
    )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validate(values, existingNames)
    if (problem) return setError(problem)
    onSubmit({ ...values, name: values.name.trim(), regularExpression: values.regularExpression.trim() })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div>
          <label htmlFor="control-value-name" className={MODAL_LABEL_CLASS}>
            Field Name <span className="text-form-required">*</span>
          </label>
          <input id="control-value-name" value={values.name} onChange={(e) => update('name', e.target.value)} placeholder="findEmail" className={MODAL_FIELD_CLASS} autoFocus />
        </div>
        <div>
          <label htmlFor="control-value-scan-type" className={MODAL_LABEL_CLASS}>
            Scan Type
          </label>
          <select id="control-value-scan-type" value={values.scanType} onChange={(e) => update('scanType', e.target.value as ScanType)} className={MODAL_FIELD_CLASS}>
            {SCAN_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-black">
        <input type="checkbox" checked={values.enabled} onChange={(e) => update('enabled', e.target.checked)} className="size-4 accent-night-950" />
        Enabled
      </label>

      {isRegexp ? (
        <>
          <div>
            <label htmlFor="control-value-regex" className={MODAL_LABEL_CLASS}>
              Regular Expression <span className="text-form-required">*</span>
            </label>
            <textarea id="control-value-regex" rows={3} value={values.regularExpression} onChange={(e) => update('regularExpression', e.target.value)} className={CODE_CLASS} />
            <p className="mt-1 text-xs text-muted">Applied to the data stored in each column during the discovery scan.</p>
          </div>
          <RegexTester id="control-value-test" pattern={values.regularExpression} placeholder="Sample value, e.g. john.doe@example.com" />
        </>
      ) : (
        <>
          <div>
            <label htmlFor="control-value-static-script" className={MODAL_LABEL_CLASS}>
              Groovy Static Script
            </label>
            <textarea id="control-value-static-script" rows={3} value={values.groovyStaticScript} onChange={(e) => update('groovyStaticScript', e.target.value)} className={CODE_CLASS} />
            <p className="mt-1 text-xs text-muted">Evaluated once before the scan (constants, lists…).</p>
          </div>
          <div>
            <label htmlFor="control-value-script" className={MODAL_LABEL_CLASS}>
              Groovy Script <span className="text-form-required">*</span>
            </label>
            <textarea id="control-value-script" rows={8} value={values.groovyScript} onChange={(e) => update('groovyScript', e.target.value)} className={CODE_CLASS} />
            <p className="mt-1 text-xs text-muted">Evaluated for each value (variable data) and must return true when the value is sensitive.</p>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="control-value-match-limit" className={MODAL_LABEL_CLASS}>
            Match Limit
          </label>
          <input
            id="control-value-match-limit"
            type="number"
            min={1}
            value={values.matchLimit}
            onChange={(e) => update('matchLimit', Number(e.target.value))}
            className={MODAL_FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="control-value-operator" className={MODAL_LABEL_CLASS}>
            Masking Operator
          </label>
          <select id="control-value-operator" value={values.maskingOperator} onChange={(e) => update('maskingOperator', e.target.value)} className={MODAL_FIELD_CLASS}>
            {MASKING_OPERATORS.map((operator) => (
              <option key={operator}>{operator}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={MODAL_LABEL_CLASS}>Allowed data types</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DATA_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-black">
              <input type="checkbox" checked={values.allowedDataTypes.includes(type)} onChange={() => toggleDataType(type)} className="size-4 accent-night-950" />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="control-value-parameters" className={MODAL_LABEL_CLASS}>
          Default Parameters
        </label>
        <input id="control-value-parameters" value={values.defaultParameters} onChange={(e) => update('defaultParameters', e.target.value)} className={MODAL_FIELD_CLASS} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-form-error">
          {error}
        </p>
      )}
      <ModalActions submitLabel={submitLabel} onCancel={onCancel} />
    </form>
  )
}

export default function ControlValuesPage() {
  const { controlValues, createControlValue, updateControlValue, deleteControlValues } = useDiscoveryRules()
  const [scanTypeFilter, setScanTypeFilter] = useState('Show All')
  const [enabledFilter, setEnabledFilter] = useState('Show All')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [toDelete, setToDelete] = useState<ControlValue | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = controlValues.filter(
    (v) => (scanTypeFilter === 'Show All' || v.scanType === scanTypeFilter) && matchesEnabledFilter(v.enabled, enabledFilter),
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const namesExcept = (id?: number) => controlValues.filter((v) => v.id !== id).map((v) => v.name.toLowerCase())

  function handleSave(values: ValueInput) {
    if (dialog?.mode === 'edit') {
      updateControlValue(dialog.value.id, values)
      setFeedback(`Control value "${values.name}" updated.`)
    } else {
      createControlValue(values)
      setFeedback(`Control value "${values.name}" created.`)
    }
    setDialog(null)
  }

  function confirmDelete() {
    if (!toDelete) return
    deleteControlValues([toDelete.id])
    setFeedback(`Control value "${toDelete.name}" deleted.`)
    setToDelete(null)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={BrainCog} title="Control Value List">
        <button type="button" onClick={() => setDialog({ mode: 'create' })} className={DARK_BUTTON_CLASS}>
          Create Control Value
        </button>
      </ListHeader>

      {feedback && <StatusMessage>{feedback}</StatusMessage>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="px-3 py-3 align-top font-semibold">Field Name</th>
              <th className="px-3 py-3 align-top font-semibold">Regular Expression</th>
              <th className="w-32 px-3 py-3 align-top font-semibold">
                Scan Type
                <ColumnFilter label="Filter by scan type" value={scanTypeFilter} options={['Show All', ...SCAN_TYPES]} onChange={setScanTypeFilter} />
              </th>
              <th className="w-24 px-3 py-3 align-top font-semibold">Match Limit</th>
              <th className="w-32 px-3 py-3 align-top font-semibold">
                Is Enabled
                <ColumnFilter label="Filter by enabled state" value={enabledFilter} options={ENABLED_FILTERS} onChange={setEnabledFilter} />
              </th>
              <th className="w-24 px-3 py-3 align-top font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((value) => (
              <tr key={value.id} className="border-b border-card-border">
                <td className={CELL}>
                  <button type="button" onClick={() => setDialog({ mode: 'edit', value })} className="font-medium text-accent-600 hover:underline">
                    {value.name}
                  </button>
                </td>
                <td className={`${CELL} max-w-96 truncate font-mono text-xs`} title={value.scanType === 'REGEXP' ? value.regularExpression : value.groovyScript}>
                  {value.scanType === 'REGEXP' ? value.regularExpression : value.groovyScript.split('\n')[0]}
                </td>
                <td className={CELL}>{value.scanType}</td>
                <td className={CELL}>{value.matchLimit}</td>
                <td className={CELL}>{value.enabled ? 'Yes' : 'No'}</td>
                <td className={CELL}>
                  <RowActions label={value.name} onEdit={() => setDialog({ mode: 'edit', value })} onDelete={() => setToDelete(value)} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted">
                  No control value found.
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
        <Modal title={dialog.mode === 'edit' ? 'Edit Control Value' : 'Custom Control Value'} size="lg" onClose={() => setDialog(null)}>
          <ControlValueForm
            initial={dialog.mode === 'edit' ? dialog.value : EMPTY_VALUE}
            existingNames={namesExcept(dialog.mode === 'edit' ? dialog.value.id : undefined)}
            submitLabel={dialog.mode === 'edit' ? 'Update' : 'Create'}
            onSubmit={handleSave}
            onCancel={() => setDialog(null)}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDeleteModal title="Delete Control Value" onConfirm={confirmDelete} onClose={() => setToDelete(null)}>
          <strong>{toDelete.name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
