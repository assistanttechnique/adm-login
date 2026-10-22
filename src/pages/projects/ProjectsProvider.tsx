import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/date'
import { ProjectsContext } from './ProjectsContext'
import { INITIAL_PROJECTS, type Project, type ProjectInput } from './projectsData'

// Ne garde que les champs saisissables du formulaire
const pickInput = ({ name, description, job, discoveryConfiguration, maskingConfiguration }: ProjectInput): ProjectInput => ({
  name,
  description,
  job,
  discoveryConfiguration,
  maskingConfiguration,
})

// Projets partagés entre la liste et la fiche projet
// TODO : remplacer l'état local par les appels API quand le backend gérera les projets
export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const nextId = useRef(Math.max(...INITIAL_PROJECTS.map((p) => p.id)) + 1)
  const username = user?.username ?? ''

  // Champs mis à jour automatiquement à chaque modification
  const stamp = useCallback(() => ({ modifiedBy: username, modifiedDate: formatDateTime(new Date()) }), [username])

  const createProject = useCallback(
    (values: ProjectInput) => {
      const id = nextId.current++
      setProjects((list) => [...list, { id, ...pickInput(values), status: 'idle', ...stamp() }])
      return id
    },
    [stamp],
  )

  const updateProject = useCallback(
    (id: number, values: ProjectInput) =>
      setProjects((list) => list.map((p) => (p.id === id ? { ...p, ...pickInput(values), ...stamp() } : p))),
    [stamp],
  )

  const deleteProjects = useCallback(
    (ids: number[]) => setProjects((list) => list.filter((p) => !ids.includes(p.id))),
    [],
  )

  // Duplique les projets sélectionnés sous le nom « Copy of … » (comme dans la maquette)
  const copyProjects = useCallback(
    (ids: number[]) => {
      const copies = projects
        .filter((p) => ids.includes(p.id))
        .map((p): Project => ({ ...p, id: nextId.current++, name: `Copy of ${p.name}`, status: 'idle', ...stamp() }))
      setProjects((list) => [...list, ...copies])
    },
    [projects, stamp],
  )

  const runProject = useCallback(
    (id: number, values: ProjectInput) =>
      setProjects((list) =>
        list.map((p) => (p.id === id ? { ...p, ...pickInput(values), status: 'running', ...stamp() } : p)),
      ),
    [stamp],
  )

  // Arrête les projets en cours parmi ceux sélectionnés ; renvoie le nombre de projets arrêtés
  const stopProjects = useCallback(
    (ids: number[]) => {
      const running = projects.filter((p) => ids.includes(p.id) && p.status === 'running').map((p) => p.id)
      if (running.length > 0) {
        setProjects((list) => list.map((p) => (running.includes(p.id) ? { ...p, status: 'stopped' } : p)))
      }
      return running.length
    },
    [projects],
  )

  const value = useMemo(
    () => ({ projects, createProject, updateProject, deleteProjects, copyProjects, runProject, stopProjects }),
    [projects, createProject, updateProject, deleteProjects, copyProjects, runProject, stopProjects],
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}
