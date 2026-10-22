import { FileChartColumn, Globe } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { ListHeader, RowActions, StatusMessage } from '../../components/ListPage'
import { Pagination } from '../../components/Pagination'
import { DARK_BUTTON_CLASS } from '../../components/formStyles'
import { DISCOVERY_CONFIGURATIONS_PATH } from '../../layouts/navigation'
import type { SavedDiscoveryConfiguration } from './discoveryConfigurationsData'
import { DiscoveryReportModal } from './DiscoveryReportModal'
import { useDiscoveryConfigurations } from './useDiscoveryConfigurations'

const PAGE_SIZE = 10
const CELL = 'px-3 py-3 align-middle'

export default function DiscoveryConfigurationsListPage() {
  const navigate = useNavigate()
  const { configurations, deleteConfigurations } = useDiscoveryConfigurations()
  const [page, setPage] = useState(1)
  const [report, setReport] = useState<SavedDiscoveryConfiguration | null>(null)
  const [toDelete, setToDelete] = useState<SavedDiscoveryConfiguration | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const pageCount = Math.max(1, Math.ceil(configurations.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = configurations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function confirmDelete() {
    if (!toDelete) return
    deleteConfigurations([toDelete.id])
    setFeedback(`Discovery configuration "${toDelete.name}" deleted.`)
    setToDelete(null)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={Globe} title="Discovery Configurations List">
        <button type="button" onClick={() => navigate(`${DISCOVERY_CONFIGURATIONS_PATH}/new`)} className={DARK_BUTTON_CLASS}>
          Create Discovery Configuration
        </button>
      </ListHeader>

      {feedback && <StatusMessage>{feedback}</StatusMessage>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="px-3 py-4 font-semibold">Discovery Name</th>
              <th className="px-3 py-4 font-semibold">Description</th>
              <th className="px-3 py-4 font-semibold">Modified by</th>
              <th className="px-3 py-4 font-semibold">Modified Date</th>
              <th className="w-28 px-3 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((configuration) => (
              <tr key={configuration.id} className="border-b border-card-border">
                <td className={`${CELL} whitespace-nowrap`}>
                  <Link to={`${DISCOVERY_CONFIGURATIONS_PATH}/${configuration.id}`} className="font-medium text-accent-600 hover:underline">
                    {configuration.name}
                  </Link>
                </td>
                <td className={CELL}>{configuration.description}</td>
                <td className={CELL}>{configuration.modifiedBy}</td>
                <td className={`${CELL} whitespace-nowrap`}>{configuration.modifiedDate}</td>
                <td className={CELL}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReport(configuration)}
                      aria-label={`Report ${configuration.name}`}
                      className="rounded p-0.5 text-night-950 transition hover:text-lilac"
                    >
                      <FileChartColumn className="size-4" />
                    </button>
                    <RowActions
                      label={configuration.name}
                      onEdit={() => navigate(`${DISCOVERY_CONFIGURATIONS_PATH}/${configuration.id}`)}
                      onDelete={() => setToDelete(configuration)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted">
                  No discovery configuration found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 mb-2">
        <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
      </div>

      {report && <DiscoveryReportModal configuration={report} onClose={() => setReport(null)} />}

      {toDelete && (
        <ConfirmDeleteModal title="Delete Discovery Configuration" onConfirm={confirmDelete} onClose={() => setToDelete(null)}>
          <strong>{toDelete.name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
