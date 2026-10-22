import { useContext } from 'react'

import { ProjectsContext } from './ProjectsContext'

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) throw new Error('useProjects doit être utilisé dans un ProjectsProvider')
  return context
}
