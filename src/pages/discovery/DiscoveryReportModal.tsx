import { Modal } from '../../components/Modal'
import type { SavedDiscoveryConfiguration } from './discoveryConfigurationsData'
import { useAssessments } from './useAssessments'
import { useDiscoveryRules } from './useDiscoveryRules'

// Rapport d'une configuration : paramètres et règles réellement appliquées par ses groupes de scan.
// Les résultats du scan (graphique « Detailed Discovery Chart ») arriveront avec le moteur de scan.
export function DiscoveryReportModal({ configuration, onClose }: { configuration: SavedDiscoveryConfiguration; onClose: () => void }) {
  const { assessments } = useAssessments()
  const { controlFields, controlValues } = useDiscoveryRules()

  const groups = assessments.filter((a) => configuration.scanGroups.includes(a.name))
  // Règles uniques et actives issues de tous les groupes sélectionnés
  const fieldIds = new Set(groups.flatMap((g) => g.controlFieldIds))
  const valueIds = new Set(groups.flatMap((g) => g.controlValueIds))
  const fields = controlFields.filter((f) => fieldIds.has(f.id) && f.enabled)
  const values = controlValues.filter((v) => valueIds.has(v.id) && v.enabled)

  const settings = [
    configuration.enableDeepScan && 'Deep scan',
    configuration.examineAllRows ? 'All rows examined' : `${configuration.rowsToSample} rows sampled`,
    configuration.scanPrimaryKeys && 'Primary keys',
    configuration.scanForeignKeys && 'Foreign keys',
  ].filter(Boolean)

  const rows = [
    ['Source Connection', configuration.sourceConnection || '—'],
    ['Scan Groups', configuration.scanGroups.join(', ') || '—'],
    ['Ignore Group', configuration.ignoreGroup || '—'],
    ['Scan Settings', settings.join(', ')],
    ['Last scan request', configuration.lastScanRequest || 'Never scanned'],
  ]

  return (
    <Modal title="Data Discovery Report" size="lg" onClose={onClose}>
      <h3 className="text-base font-bold text-black">{configuration.name}</h3>
      <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-form-label">{label}</dt>
            <dd className="font-medium text-black">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <section>
          <h4 className="mb-2 text-sm font-semibold text-black">Control Fields applied ({fields.length})</h4>
          <p className="text-sm text-ink">{fields.map((f) => f.name).join(', ') || '—'}</p>
        </section>
        <section>
          <h4 className="mb-2 text-sm font-semibold text-black">Control Values applied ({values.length})</h4>
          <p className="text-sm text-ink">{values.map((v) => v.name).join(', ') || '—'}</p>
        </section>
      </div>

      <p className="mt-5 rounded-md bg-content px-4 py-3 text-sm text-muted">
        Detailed Discovery Chart: no scan result available yet (the scan engine is not connected).
      </p>
    </Modal>
  )
}
