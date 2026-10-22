import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { Checkbox, SelectField } from '../../components/FormFields'
import { MultiSelect } from '../../components/MultiSelect'
import { Select } from '../../components/Select'
import { LABEL_CLASS, PRIMARY_BUTTON_CLASS, TEXT_FIELD_CLASS } from '../../components/formStyles'
import { DISCOVERY_CONFIGURATIONS_PATH } from '../../layouts/navigation'
import { useConnections } from '../connections/useConnections'
import {
  EMPTY_DISCOVERY_CONFIGURATION,
  IGNORE_GROUPS,
  ROWS_TO_SAMPLE,
  validateDiscoveryConfiguration,
  type DiscoveryConfiguration,
  type SavedDiscoveryConfiguration,
} from './discoveryConfigurationsData'
import { useAssessments } from './useAssessments'
import { useDiscoveryConfigurations } from './useDiscoveryConfigurations'

type Feedback = { type: 'success' | 'error'; lines: string[] } | null

const SCAN_SETTINGS: { key: 'enableDeepScan' | 'examineAllRows' | 'scanPrimaryKeys' | 'scanForeignKeys'; label: string }[] = [
  { key: 'enableDeepScan', label: 'Enable Deep Scan' },
  { key: 'examineAllRows', label: 'Examine all rows' },
  { key: 'scanPrimaryKeys', label: 'Scan Primary Keys' },
  { key: 'scanForeignKeys', label: 'Scan foreign keys' },
]

function DiscoveryConfigurationForm({ configuration }: { configuration?: SavedDiscoveryConfiguration }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { connections } = useConnections()
  const { assessments } = useAssessments()
  const { configurations, saveConfiguration, requestScan } = useDiscoveryConfigurations()
  const [values, setValues] = useState<DiscoveryConfiguration>(configuration ?? EMPTY_DISCOVERY_CONFIGURATION)
  // Message transmis après la création (redirection vers la fiche de la nouvelle configuration)
  const [feedback, setFeedback] = useState<Feedback>(() => {
    const state = location.state as { messages?: string[] } | null
    return state?.messages ? { type: 'success', lines: state.messages } : null
  })

  function update<K extends keyof DiscoveryConfiguration>(field: K, value: DiscoveryConfiguration[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    // Les erreurs affichées ne correspondent plus au formulaire modifié
    setFeedback((current) => (current?.type === 'error' ? null : current))
  }

  // Valide puis enregistre la configuration ; renvoie son id, ou null si le formulaire est incomplet
  function persist(): number | null {
    const name = values.name.trim()
    const issues = validateDiscoveryConfiguration(values)
    if (configurations.some((c) => c.id !== configuration?.id && c.name.toLowerCase() === name.toLowerCase())) {
      issues.push('A discovery configuration with this name already exists.')
    }
    if (issues.length > 0) {
      setFeedback({ type: 'error', lines: issues })
      return null
    }
    return saveConfiguration({ ...values, name, description: values.description.trim() }, configuration?.id)
  }

  // Après une création, on bascule sur l'URL de la nouvelle configuration
  function done(id: number, messages: string[]) {
    if (configuration) setFeedback({ type: 'success', lines: messages })
    else navigate(`${DISCOVERY_CONFIGURATIONS_PATH}/${id}`, { replace: true, state: { messages } })
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = persist()
    if (id !== null) done(id, ['Discovery configuration saved. It can now be used in Masking Configurations and Projects.'])
  }

  function handleScan() {
    const id = persist()
    if (id === null) return
    requestScan(id)
    const rows = values.examineAllRows ? 'all rows' : `${values.rowsToSample} rows sampled`
    done(id, [
      `Configuration saved and scan requested on ${values.sourceConnection} (${values.scanGroups.join(', ')} – ${rows}).`,
      'The scan engine is not connected yet: no result will be produced for now.',
    ])
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-[30px]">
      <h1 className="bg-night-950 px-6 py-5 text-[15px] font-bold text-white">
        {configuration ? 'Edit Discovery Configuration' : 'Create Discovery Configuration'}
      </h1>

      <form onSubmit={handleSave} noValidate className="mt-6">
        <div className="grid gap-x-14 gap-y-6 md:grid-cols-2">
          {/* Colonne de gauche : identification et source */}
          <div className="space-y-6">
            <div>
              <label htmlFor="discovery-name" className={LABEL_CLASS}>
                Discovery Name*
              </label>
              <input id="discovery-name" value={values.name} onChange={(e) => update('name', e.target.value)} className={`${TEXT_FIELD_CLASS} h-12`} />
            </div>

            <SelectField id="discovery-source" label="Source Connection*">
              <Select
                id="discovery-source"
                labelId="discovery-source-label"
                value={values.sourceConnection}
                options={connections.map((c) => c.name)}
                placeholder="Source Connection"
                onChange={(source) => update('sourceConnection', source)}
              />
            </SelectField>

            <SelectField id="discovery-ignore-group" label="Select Ignore Group">
              <Select
                id="discovery-ignore-group"
                labelId="discovery-ignore-group-label"
                value={values.ignoreGroup}
                options={IGNORE_GROUPS}
                placeholder="Select an ignore group"
                onChange={(group) => update('ignoreGroup', group)}
              />
            </SelectField>
          </div>

          {/* Colonne de droite : description et paramètres du scan */}
          <div className="space-y-6">
            <div>
              <label htmlFor="discovery-description" className={LABEL_CLASS}>
                Description
              </label>
              <input
                id="discovery-description"
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                className={`${TEXT_FIELD_CLASS} h-12`}
              />
            </div>

            <SelectField id="discovery-scan-groups" label="Select Compliance regulatory scan group to use*">
              <MultiSelect
                id="discovery-scan-groups"
                labelId="discovery-scan-groups-label"
                values={values.scanGroups}
                options={assessments.map((a) => a.name)}
                onChange={(groups) => update('scanGroups', groups)}
              />
            </SelectField>

            <fieldset>
              <legend className={LABEL_CLASS}>Scan Settings</legend>
              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {SCAN_SETTINGS.map(({ key, label }) => (
                  <Checkbox
                    key={key}
                    id={`discovery-${key}`}
                    label={label}
                    checked={values[key]}
                    onChange={(checked) => update(key, checked)}
                  />
                ))}
              </div>
            </fieldset>

            <SelectField id="discovery-rows" label="Rows to sample">
              {/* Inutile d'échantillonner quand toutes les lignes sont examinées */}
              <Select
                id="discovery-rows"
                labelId="discovery-rows-label"
                value={values.rowsToSample}
                options={ROWS_TO_SAMPLE}
                disabled={values.examineAllRows}
                onChange={(rows) => update('rowsToSample', rows)}
              />
            </SelectField>
          </div>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`mt-8 rounded-md px-4 py-3 text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}
          >
            {feedback.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" onClick={handleScan} className={PRIMARY_BUTTON_CLASS}>
            Scan
          </button>
          <button type="submit" className={PRIMARY_BUTTON_CLASS}>
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

// Fiche configuration : création (/new) ou modification (/:configurationId)
export default function DiscoveryConfigurationPage() {
  const { configurationId } = useParams()
  const { configurations } = useDiscoveryConfigurations()

  if (!configurationId) return <DiscoveryConfigurationForm key="new" />

  const configuration = configurations.find((c) => c.id === Number(configurationId))
  if (!configuration) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-card">
        <p className="text-lg font-semibold text-black">Discovery configuration not found.</p>
        <Link to={DISCOVERY_CONFIGURATIONS_PATH} className="mt-3 inline-block text-sm font-semibold text-accent-600 hover:underline">
          Back to the discovery configurations list
        </Link>
      </div>
    )
  }

  return <DiscoveryConfigurationForm key={configuration.id} configuration={configuration} />
}
