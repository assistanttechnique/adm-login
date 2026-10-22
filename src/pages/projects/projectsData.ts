export type ProjectStatus = 'idle' | 'running' | 'stopped'

export interface Project {
  id: number
  name: string
  description: string
  job: string
  discoveryConfiguration: string
  maskingConfiguration: string
  status: ProjectStatus
  modifiedBy: string
  modifiedDate: string
}

export type ProjectInput = Pick<Project, 'name' | 'description' | 'job' | 'discoveryConfiguration' | 'maskingConfiguration'>

export const EMPTY_PROJECT: ProjectInput = {
  name: '',
  description: '',
  job: '',
  discoveryConfiguration: '',
  maskingConfiguration: '',
}

// Règles vérifiées par « Validate » et avant « Run » ; renvoie la liste des problèmes
export function validateProject(project: ProjectInput): string[] {
  const issues: string[] = []
  if (!project.name.trim()) issues.push('Project name is required.')
  if (!project.maskingConfiguration) issues.push('Select a masking configuration (Masking Configurations tab).')
  return issues
}

const row = (id: number, name: string, description: string, modifiedBy: string, modifiedDate: string): Project => ({
  id,
  name,
  description,
  job: '',
  discoveryConfiguration: '',
  maskingConfiguration: '',
  status: 'idle',
  modifiedBy,
  modifiedDate,
})

// Données de départ reprises de la maquette (gérées uniquement côté front pour l'instant)
export const INITIAL_PROJECTS: Project[] = [
  row(1, 'Copy of Oracle SRC on 10.11.12.73', 'Copy of Oracle SRC on 10.11.12.73 TO Oracle DEST', 'Admin', '2023-11-23 14:53:07'),
  row(2, 'Copy2 of Oracle SRC on 10.11.12.73', 'Copy2 of Oracle SRC on 10.11.12.73 TO Oracle DEST', 'Admin', '2020-01-20 21:48:48'),
  row(3, 'Test Project', '', '', '2022-11-22 00:57:14'),
  row(4, 'Export to Excel – Project', 'Export to Excel – Project', 'Admin', '2020-02-02 00:23:16'),
  row(5, 'New 10M Project', '', 'Admin', '2023-11-23 14:53:07'),
  row(6, 'Test MC 3 – Project', 'Test MC 3 – Project', 'Admin', '2020-01-20 21:48:48'),
  row(7, 'TEST Update– Oracle Source on 10.11.12.73', 'TEST Update– Oracle Source on 10.11.12.73', 'Admin', '2023-11-23 14:53:07'),
  {
    ...row(
      8,
      'Performance demonstration',
      'Data Masking Performance Demonstration: Securing Sensitive Information in Real-Time',
      'Admin',
      '2025-01-30 21:16:45',
    ),
    job: 'sensitive data while maintaining data usability for business operations',
  },
]
