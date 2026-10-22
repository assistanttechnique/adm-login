export interface Assessment {
  id: number
  name: string
  description: string
  // Règles utilisées par ce groupe de scan (ids des Control Fields / Control Values)
  controlFieldIds: number[]
  controlValueIds: number[]
}

export type AssessmentInput = Omit<Assessment, 'id'>

export const EMPTY_ASSESSMENT: AssessmentInput = { name: '', description: '', controlFieldIds: [], controlValueIds: [] }

// Ids des Control Fields « nom » (first, middle, last, full, nickname) — voir controlRulesData.ts
const NAMES = [2, 3, 4, 5, 6]

const row = (id: number, name: string, description: string, controlFieldIds: number[], controlValueIds: number[]): Assessment => ({
  id,
  name,
  description,
  controlFieldIds,
  controlValueIds,
})

// Groupes de scan par réglementation, repris de la maquette.
// Les associations aux règles sont des choix de départ plausibles, à ajuster dans l'écran d'édition.
export const INITIAL_ASSESSMENTS: Assessment[] = [
  row(1, 'PII', 'Personally Identifiable/Gramm-Leach-Billey Act Scan Group', [1, ...NAMES, 12], [1, 2, 3, 4, 12]),
  row(2, 'PCI', 'Payment Card Industry Data/Security Standard Scan Group', [], [13]),
  row(3, 'HIPAA', 'Health Insurance Portability and Accountability Act Scan Group', [1, 2, 4, 7, 12], [3, 8, 9, 10]),
  row(4, 'GDPR', 'General Data Protection Regulation Scan Group', [...NAMES, 7, 8], [1, 2, 12]),
  row(
    5,
    'FERPA/COPPA',
    "Family Educational Rights and Privacy Act/Children's Online Privacy Protection Act Scan Group",
    [...NAMES, 10, 12],
    [2, 8, 9, 10],
  ),
  row(6, 'CCPA', 'California Consumer Privacy Act Scan Group', [1, ...NAMES], [1, 2, 3, 12]),
  row(7, 'PIPEDA', 'Personal Information Protection and Electronic Documents Act Scan Group', [1, ...NAMES], [1, 5, 6, 12]),
  row(8, 'LGPD', 'Lei Geral de Protecao de Dados Pessoais Scan Group', NAMES, [1, 2, 12]),
]
