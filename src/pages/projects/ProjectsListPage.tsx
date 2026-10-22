import { Network, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
import { SettingsMenu } from '../../components/SettingsMenu'
import type { Project } from './projectsData'
import { useProjects } from './useProjects'

const DARK_BUTTON =
  'rounded-md bg-night-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50'
const CELL = 'px-4 py-3 align-middle'

type Feedback = { type: 'success' | 'info'; text: string } | null

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const { projects, deleteProjects, copyProjects, stopProjects } = useProjects()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  // Projets dont la suppression attend une confirmation
  const [toDelete, setToDelete] = useState<Project[] | null>(null)

  const visible = projects.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))

  function toggle(id: number) {
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))
  }

  function handleStop() {
    const stopped = stopProjects(selected)
    setFeedback(
      stopped > 0
        ? { type: 'success', text: `${stopped} project(s) stopped.` }
        : { type: 'info', text: 'None of the selected projects is running.' },
    )
  }

  function handleCopy() {
    copyProjects(selected)
    setFeedback({ type: 'success', text: `${selected.length} project(s) copied.` })
    setSelected([])
  }

  function confirmDelete() {
    if (!toDelete) return
    const ids = toDelete.map((p) => p.id)
    deleteProjects(ids)
    setSelected((list) => list.filter((id) => !ids.includes(id)))
    setFeedback({ type: 'success', text: `${ids.length} project(s) deleted.` })
    setToDelete(null)
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-[15px] font-bold text-black">
          <Network className="size-7 text-night-950" strokeWidth={1.5} />
          Projects List
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate('/admin/projects/new')} className={DARK_BUTTON}>
            Create Project
          </button>
          <button type="button" onClick={handleStop} disabled={selected.length === 0} className={DARK_BUTTON}>
            Stop Project
          </button>
          <SettingsMenu
            items={[
              { label: 'Copy selected projects', onClick: handleCopy, disabled: selected.length === 0 },
              {
                label: 'Delete selected projects',
                onClick: () => setToDelete(projects.filter((p) => selected.includes(p.id))),
                disabled: selected.length === 0,
              },
            ]}
          />
        </div>
      </div>

      {feedback && (
        <p
          role="status"
          className={`mt-4 rounded-md px-4 py-2.5 text-sm ${
            feedback.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-content text-ink'
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm text-black">
          <thead className="bg-night-950 text-white">
            <tr>
              <th className="px-4 py-3 align-top font-semibold">
                Project Name
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search by project name"
                  className="mt-1.5 block h-6 w-40 rounded-sm bg-white px-2 text-xs font-normal text-black outline-none focus:ring-2 focus:ring-lilac"
                />
              </th>
              <th className="px-4 py-3 align-top font-semibold">Description</th>
              <th className="px-4 py-3 align-top font-semibold">Modified by</th>
              <th className="px-4 py-3 align-top font-semibold">Modified Date</th>
              <th className="px-4 py-3 align-top font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((project) => (
              <tr key={project.id} className="border-b border-card-border">
                <td className={CELL}>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(project.id)}
                      onChange={() => toggle(project.id)}
                      aria-label={`Select ${project.name}`}
                      className="size-4 shrink-0 accent-night-950"
                    />
                    <span className="line-clamp-2 max-w-60">{project.name}</span>
                    {project.status === 'running' && (
                      <span className="shrink-0 rounded-full bg-lilac/15 px-2 py-0.5 text-[11px] font-semibold text-accent-600">
                        Running
                      </span>
                    )}
                  </label>
                </td>
                <td className={CELL}>
                  <span className="line-clamp-2 max-w-72" title={project.description}>
                    {project.description}
                  </span>
                </td>
                <td className={CELL}>{project.modifiedBy}</td>
                <td className={`${CELL} whitespace-nowrap`}>{project.modifiedDate}</td>
                <td className={CELL}>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/projects/${project.id}`}
                      aria-label={`Edit ${project.name}`}
                      className="rounded p-0.5 text-night-950 transition hover:text-lilac"
                    >
                      <SquarePen className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete([project])}
                      aria-label={`Delete ${project.name}`}
                      className="rounded p-0.5 text-night-950 transition hover:text-form-error"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No project found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <ConfirmDeleteModal
          title={toDelete.length > 1 ? 'Delete Projects' : 'Delete Project'}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        >
          <strong>{toDelete.length > 1 ? `${toDelete.length} projects` : toDelete[0].name}</strong>
        </ConfirmDeleteModal>
      )}
    </div>
  )
}
