import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { Select } from '../../components/Select'
import { PROJECTS_LIST_PATH } from '../../layouts/navigation'
import { useDiscoveryConfigurations } from '../discovery/useDiscoveryConfigurations'
import { useMaskingConfigurations } from '../masking/useMaskingConfigurations'
import { EMPTY_PROJECT, validateProject, type Project, type ProjectInput, type ProjectStatus } from './projectsData'
import { useProjects } from './useProjects'

const TABS = [
  { id: 'properties', label: 'Project Properties' },
  { id: 'discovery', label: 'Discovery Configurations' },
  { id: 'masking', label: 'Masking Configurations' },
] as const

type TabId = (typeof TABS)[number]['id']
type Feedback = { type: 'success' | 'error'; lines: string[] } | null

const FIELD_CLASS =
  'w-full rounded-md border border-[#d5d5dc] bg-white px-4 text-[15px] text-[#555] outline-none transition focus:border-lilac'
const BUTTON_CLASS =
  'rounded-lg bg-night-950 px-10 py-3 text-lg font-semibold text-white transition hover:bg-brand-800 sm:px-14'

const STATUS_LABELS: Record<ProjectStatus, string> = { idle: 'Not started', running: 'Running', stopped: 'Stopped' }

function Row({ label, htmlFor, labelId, children }: { label: string; htmlFor?: string; labelId?: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[230px_1fr] sm:gap-4">
      <label id={labelId} htmlFor={htmlFor} className="text-[15px] font-medium text-black">
        {label}
      </label>
      {children}
    </div>
  )
}

function ProjectForm({ project }: { project?: Project }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { createProject, updateProject, runProject } = useProjects()
  const { configurations } = useMaskingConfigurations()
  const { configurations: discoveryConfigurations } = useDiscoveryConfigurations()
  const [tab, setTab] = useState<TabId>('properties')
  const [values, setValues] = useState<ProjectInput>(project ?? EMPTY_PROJECT)
  // Message transmis après la création (redirection vers la fiche du nouveau projet)
  const [feedback, setFeedback] = useState<Feedback>(
    (location.state as { created?: boolean } | null)?.created ? { type: 'success', lines: ['Project created.'] } : null,
  )

  const update = (field: keyof ProjectInput, value: string) => setValues((v) => ({ ...v, [field]: value }))
  const activeTab = TABS.find((t) => t.id === tab)!

  function requireName(): boolean {
    if (values.name.trim()) return true
    setTab('properties')
    setFeedback({ type: 'error', lines: ['Project name is required.'] })
    return false
  }

  function handleCreate() {
    if (!requireName()) return
    const id = createProject(values)
    navigate(`/admin/projects/${id}`, { replace: true, state: { created: true } })
  }

  function handleUpdate() {
    if (!project || !requireName()) return
    updateProject(project.id, values)
    setFeedback({ type: 'success', lines: ['Project updated.'] })
  }

  function handleValidate() {
    const issues = validateProject(values)
    setFeedback(issues.length > 0 ? { type: 'error', lines: issues } : { type: 'success', lines: ['Project is valid and ready to run.'] })
  }

  function handleRun() {
    if (!project) return
    if (project.status === 'running') {
      setFeedback({ type: 'success', lines: ['This project is already running.'] })
      return
    }
    const issues = validateProject(values)
    if (issues.length > 0) {
      setFeedback({ type: 'error', lines: issues })
      return
    }
    // TODO : déclencher l'exécution réelle via l'API
    runProject(project.id, values)
    setFeedback({ type: 'success', lines: ['Project saved and started.'] })
  }

  return (
    <div className="rounded-sm bg-white shadow-card">
      <div role="tablist" aria-label="Project sections" className="flex flex-wrap gap-1 border-b border-card-border px-1.5 pt-1.5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls="project-tabpanel"
            onClick={() => setTab(id)}
            className={`rounded-t-md px-5 py-3 text-[13px] font-bold text-black transition ${
              tab === id ? 'bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.06)]' : 'bg-[#ececee] hover:bg-[#e2e2e6]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="border-b border-card-border px-6 py-5 text-xl font-bold text-black">{activeTab.label}</h2>

      <div id="project-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4 px-6 py-6">
        {tab === 'properties' && (
          <>
            <Row label="Project name" htmlFor="project-name">
              <input id="project-name" value={values.name} onChange={(e) => update('name', e.target.value)} className={`${FIELD_CLASS} h-12`} />
            </Row>
            {project && (
              <>
                <Row label="Modified by">
                  <p className="text-[15px] font-semibold text-black">{project.modifiedBy || '—'}</p>
                </Row>
                <Row label="Modified date">
                  <p className="text-[15px] text-black">{project.modifiedDate}</p>
                </Row>
                <Row label="Status">
                  <p className="text-[15px] text-black">{STATUS_LABELS[project.status]}</p>
                </Row>
              </>
            )}
            <Row label="Description" htmlFor="project-description">
              <textarea
                id="project-description"
                rows={2}
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                className={`${FIELD_CLASS} resize-y py-3 text-sm text-black`}
              />
            </Row>
            <Row label="Job for this operation" htmlFor="project-job">
              <input id="project-job" value={values.job} onChange={(e) => update('job', e.target.value)} className={`${FIELD_CLASS} h-12 text-sm text-black`} />
            </Row>
          </>
        )}

        {tab === 'discovery' && (
          <Row label="Discovery Configuration" labelId="project-discovery-label">
            <Select
              id="project-discovery"
              labelId="project-discovery-label"
              value={values.discoveryConfiguration}
              options={discoveryConfigurations.map((c) => c.name)}
              placeholder="Select a discovery configuration"
              onChange={(value) => update('discoveryConfiguration', value)}
            />
          </Row>
        )}

        {tab === 'masking' && (
          <Row label="Masking Configuration" labelId="project-masking-label">
            {configurations.length > 0 ? (
              <Select
                id="project-masking"
                labelId="project-masking-label"
                value={values.maskingConfiguration}
                options={configurations.map((c) => c.name)}
                placeholder="Select a masking configuration"
                onChange={(value) => update('maskingConfiguration', value)}
              />
            ) : (
              <p className="text-sm text-muted">
                No masking configuration yet.{' '}
                <Link to="/admin/masking-configurations" className="font-semibold text-accent-600 hover:underline">
                  Create one in Masking Configurations
                </Link>
                .
              </p>
            )}
          </Row>
        )}

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`rounded-md px-4 py-3 text-sm ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}
          >
            {feedback.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-4 pt-6">
          {project ? (
            <>
              <button type="button" onClick={handleUpdate} className={BUTTON_CLASS}>
                Update
              </button>
              <button type="button" onClick={handleValidate} className={BUTTON_CLASS}>
                Validate
              </button>
              <button type="button" onClick={handleRun} className={BUTTON_CLASS}>
                Run
              </button>
            </>
          ) : (
            <button type="button" onClick={handleCreate} className={BUTTON_CLASS}>
              Create
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Fiche projet : création (/admin/projects/new) ou modification (/admin/projects/:projectId)
export default function ProjectEditPage() {
  const { projectId } = useParams()
  const { projects } = useProjects()

  if (!projectId) return <ProjectForm key="new" />

  const project = projects.find((p) => p.id === Number(projectId))
  if (!project) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-card">
        <p className="text-lg font-semibold text-black">Project not found.</p>
        <Link to={PROJECTS_LIST_PATH} className="mt-3 inline-block text-sm font-semibold text-accent-600 hover:underline">
          Back to the projects list
        </Link>
      </div>
    )
  }

  return <ProjectForm key={project.id} project={project} />
}
