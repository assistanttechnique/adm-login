import { CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Checkbox, SelectField } from '../../components/FormFields'
import { Select } from '../../components/Select'
import { LABEL_CLASS, PRIMARY_BUTTON_CLASS, TEXT_FIELD_CLASS } from '../../components/formStyles'
import { useConnections } from '../connections/useConnections'
import { useMaskingConfigurations } from './useMaskingConfigurations'
import { useDiscoveryConfigurations } from '../discovery/useDiscoveryConfigurations'
import {
  EMPTY_MASKING_CONFIGURATION,
  HELP,
  TABLE_OPERATIONS,
  type MaskingConfiguration,
  type SourceMode,
} from './maskingData'

const SOURCE_MODES: { value: SourceMode; label: string }[] = [
  { value: 'source', label: 'Source Connection' },
  { value: 'discovery', label: 'Discovery Configuration' },
]

type Errors = Partial<Record<'name' | 'description', string>>

export default function MaskingConfigurationPage() {
  const { connections } = useConnections()
  const { saveConfiguration } = useMaskingConfigurations()
  const [values, setValues] = useState<MaskingConfiguration>(EMPTY_MASKING_CONFIGURATION)
  const [errors, setErrors] = useState<Errors>({})
  const [saved, setSaved] = useState<MaskingConfiguration | null>(null)
  // Id de la configuration enregistrée : « Edit » puis « Next » la met à jour au lieu d'en créer une autre
  const [savedId, setSavedId] = useState<number | undefined>(undefined)

  const { configurations: discoveryConfigurations } = useDiscoveryConfigurations()
  const connectionNames = connections.map((c) => c.name).sort((a, b) => a.localeCompare(b))
  const discoveryNames = discoveryConfigurations.map((c) => c.name)
  const isDiscovery = values.sourceMode === 'discovery'

  function update<K extends keyof MaskingConfiguration>(field: K, value: MaskingConfiguration[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function changeSourceMode(sourceMode: SourceMode) {
    // La source et l'opération dépendent du mode : on les réinitialise
    setValues((v) => ({ ...v, sourceMode, source: '', tableOperation: '' }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Errors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter a name for this configuration.'
    if (!values.description.trim()) nextErrors.description = 'Please enter a description for this configuration.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    // TODO : passer à l'étape suivante de l'assistant quand elle sera définie
    const configuration = { ...values, name: values.name.trim(), description: values.description.trim() }
    setSavedId(saveConfiguration(configuration, savedId))
    setSaved(configuration)
  }

  function reset() {
    setValues(EMPTY_MASKING_CONFIGURATION)
    setSaved(null)
    setSavedId(undefined)
  }

  if (saved) {
    const summary = [
      ['Name', saved.name],
      ['Description', saved.description],
      [saved.sourceMode === 'discovery' ? 'Discovery Configuration' : 'Source Connection', saved.source || '—'],
      ['Destination Connection', saved.destination || '—'],
      ['Default Table Operation', saved.tableOperation || '—'],
      ...(saved.sourceMode === 'discovery'
        ? [
            ['Disable Constraints', saved.disableConstraints ? 'Yes' : 'No'],
            ['Apply Field Operator', saved.applyFieldOperator ? 'Yes' : 'No'],
          ]
        : [['Single thread when used as destination', saved.singleThreadDestination ? 'Yes' : 'No']]),
    ]

    return (
      <div className="rounded-xl bg-white p-4 shadow-card sm:p-[30px]">
        <div className="flex items-center gap-3 bg-night-950 px-6 py-5 text-white">
          <CircleCheck className="size-5 text-lilac" />
          <h1 className="text-[15px] font-bold">Masking Configuration Saved</h1>
        </div>
        <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {summary.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-form-label">{label}</dt>
              <dd className="font-medium text-black">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted">
          This configuration can now be selected in a project. The next steps of the wizard are not available yet.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setSaved(null)} className="rounded-lg border-2 border-night-950 px-6 py-3 font-semibold text-night-950 transition hover:bg-content">
            Edit
          </button>
          <button type="button" onClick={reset} className="rounded-lg bg-night-950 px-6 py-3 font-semibold text-white transition hover:bg-brand-800">
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-[30px]">
      <h1 className="bg-night-950 px-6 py-5 text-[15px] font-bold text-white">Create Masking Configurations</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        <div>
          <label htmlFor="masking-name" className={LABEL_CLASS}>
            * Enter a name for this configuration
          </label>
          <input
            id="masking-name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={`${TEXT_FIELD_CLASS} h-14`}
          />
          {errors.name && <p className="mt-1.5 text-sm text-form-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="masking-description" className={LABEL_CLASS}>
            * Enter a description for this configuration
          </label>
          <textarea
            id="masking-description"
            rows={2}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            aria-invalid={Boolean(errors.description)}
            className={`${TEXT_FIELD_CLASS} resize-y py-4`}
          />
          {errors.description && <p className="mt-1.5 text-sm text-form-error">{errors.description}</p>}
        </div>

        <fieldset>
          <legend className="mb-2 text-[15px] font-semibold text-black">Select Connection Type</legend>
          <div className="space-y-1.5">
            {SOURCE_MODES.map(({ value, label }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-[15px] text-black">
                <input
                  type="radio"
                  name="source-mode"
                  value={value}
                  checked={values.sourceMode === value}
                  onChange={() => changeSourceMode(value)}
                  className="size-4 cursor-pointer"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* grid-flow-dense : « Apply Field Operator » remonte à côté de « Disable Constraints » tant qu'aucune source n'est choisie */}
        <div className="grid grid-flow-dense gap-x-11 gap-y-6 md:grid-cols-2">
          <SelectField id="masking-source" label={isDiscovery ? 'Discovery Configuration' : 'Source Connection'}>
            <Select
              id="masking-source"
              labelId="masking-source-label"
              value={values.source}
              options={isDiscovery ? discoveryNames : connectionNames}
              onChange={(source) => update('source', source)}
            />
          </SelectField>

          <SelectField id="masking-destination" label="Destination Connection" help={HELP.destination}>
            <Select
              id="masking-destination"
              labelId="masking-destination-label"
              value={values.destination}
              options={connectionNames}
              placeholder="Select Type"
              onChange={(destination) => update('destination', destination)}
            />
          </SelectField>

          {values.source && (
            <div className="md:col-start-1">
              <SelectField id="masking-operation" label="Default Table Operation">
                <Select
                  id="masking-operation"
                  labelId="masking-operation-label"
                  value={values.tableOperation}
                  options={TABLE_OPERATIONS}
                  onChange={(operation) => update('tableOperation', operation)}
                />
              </SelectField>
            </div>
          )}

          {/* Options propres à chaque mode, d'après les deux variantes vues dans les vidéos ADM */}
          {isDiscovery ? (
            <>
              <div className="self-center md:col-start-2">
                <Checkbox
                  id="masking-disable-constraints"
                  label="Disable Constraints"
                  help={HELP.disableConstraints}
                  checked={values.disableConstraints}
                  onChange={(checked) => update('disableConstraints', checked)}
                />
              </div>

              <div className="md:col-start-1">
                <Checkbox
                  id="masking-apply-field-operator"
                  label="Apply Field Operator"
                  help={HELP.applyFieldOperator}
                  checked={values.applyFieldOperator}
                  onChange={(checked) => update('applyFieldOperator', checked)}
                />
              </div>
            </>
          ) : (
            <div className="self-center md:col-start-2">
              <Checkbox
                id="masking-single-thread"
                label="Single thread when used as destination"
                help={HELP.singleThreadDestination}
                checked={values.singleThreadDestination}
                onChange={(checked) => update('singleThreadDestination', checked)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" className={PRIMARY_BUTTON_CLASS}>
            Next
          </button>
        </div>
      </form>
    </div>
  )
}
