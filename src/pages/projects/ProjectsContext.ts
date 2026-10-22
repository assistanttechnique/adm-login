import { createContext } from 'react'

import type { Project, ProjectInput } from './projectsData'

export interface ProjectsContextValue {
  projects: Project[]
  createProject: (values: ProjectInput) => number
  updateProject: (id: number, values: ProjectInput) => void
  deleteProjects: (ids: number[]) => void
  copyProjects: (ids: number[]) => void
  runProject: (id: number, values: ProjectInput) => void
  stopProjects: (ids: number[]) => number
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null)
