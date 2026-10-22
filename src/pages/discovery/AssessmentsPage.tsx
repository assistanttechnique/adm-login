import { Network } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { ListHeader, RowActions, StatusMessage } from '../../components/ListPage'
import { Pagination } from '../../components/Pagination'
import { SettingsMenu } from '../../components/SettingsMenu'
import { DARK_BUTTON_CLASS } from '../../components/formStyles'
import { ASSESSMENTS_PATH } from '../../layouts/navigation'
import type { Assessment } from './assessmentsData'
import { useAssessments } from './useAssessments'

const PAGE_SIZE = 8
const CELL = 'px-3 py-3 align-middle'

export default function AssessmentsPage() {
  const navigate = useNavigate()
  const { assessments, deleteAssessments, copyAssessments } = useAssessments()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])
  // Assessments dont la suppression attend une confirmation
  const [toDelete, setToDelete] = useState<Assessment[] | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const pageCount = Math.max(1, Math.ceil(assessments.length / PAGE_SIZE))
  // Après une suppression, la page courante peut ne plus exister
  const currentPage = Math.min(page, pageCount)
  const visible = assessments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function toggle(id: number) {
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  }

  function handleCopy() {
    copyAssessments(selected)
    setFeedback(`${selected.length} assessment(s) copied.`)
    setSelected([])
  }

  function confirmDelete() {
    if (!toDelete) return
    const ids = toDelete.map((a) => a.id)
    deleteAssessments(ids)
    setSelected((list) => list.filter((id) => !ids.includes(id)))
    setFeedback(`${ids.length} assessment(s) deleted.`)
    setToDelete(null)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-5">
      <ListHeader icon={Network} title="Assessment List">
        <button type="button" onClick={() => navigate(`${ASSESSMENTS_PATH}/new`)} className={DARK_BUTTON_CLASS}>
          Create Assessment
        </button>
        <SettingsMenu
          items={[
            { label: 'Copy selected assessments', onClick: handleCopy, disabled: selected.length === 0 },
            {
              label: 'Delete selected assessments',
              onClick: () => setToDelete(assessments.filter((a) => selected.includes(a.id))),
              disabled: selected.length === 0,
            },
          ]}
        />
      </ListHeader>

      {feedback && <StatusMessage>{feedback}</StatusMessage>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px] text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="w-12 px-3 py-4" aria-label="Selection" />
              <th className="px-3 py-4 font-semibold">Assessment Name</th>
              <th className="px-3 py-4 font-semibold">Description</th>
              <th className="w-24 px-3 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((assessment) => (
              <tr key={assessment.id} className="border-b border-card-border">
                <td className={`${CELL} text-center`}>
                  <input
                    type="checkbox"
                    checked={selected.includes(assessment.id)}
                    onChange={() => toggle(assessment.id)}
                    aria-label={`Select ${assessment.name}`}
                    className="size-4 accent-night-950"
                  />
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  <Link to={`${ASSESSMENTS_PATH}/${assessment.id}`} className="hover:text-accent-600 hover:underline">
                    {assessment.name}
                  </Link>
                </td>
                <td className={CELL}>{assessment.description}</td>
                <td className={CELL}>
                  <RowActions
                    label={assessment.name}
                    onEdit={() => navigate(`${ASSESSMENTS_PATH}/${assessment.id}`)}
                    onDelete={() => setToDelete([assessment])}
                  />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  No assessment found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12 mb-4">
        <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
      </div>

      {toDelete && (
        <ConfirmDeleteModal
          title={toDelete.length > 1 ? 'Delete Assessments' : 'Delete Assessment'}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        >
          <strong>{toDelete.length > 1 ? `${toDelete.length} assessments` : toDelete[0].name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
