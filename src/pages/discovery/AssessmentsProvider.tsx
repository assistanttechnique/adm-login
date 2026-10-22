import { useCallback, useMemo, type ReactNode } from 'react'

import { useCollection } from '../../hooks/useCollection'
import { AssessmentsContext } from './AssessmentsContext'
import { INITIAL_ASSESSMENTS, type AssessmentInput } from './assessmentsData'

// Ne garde que les champs saisissables (évite d'écraser l'id avec un objet complet)
const pickInput = ({ name, description, controlFieldIds, controlValueIds }: AssessmentInput): AssessmentInput => ({
  name,
  description,
  controlFieldIds,
  controlValueIds,
})

// Assessments (groupes de scan) partagés entre les pages Discovery
// TODO : remplacer l'état local par les appels API
export function AssessmentsProvider({ children }: { children: ReactNode }) {
  const { items: assessments, create, update, remove } = useCollection(INITIAL_ASSESSMENTS)

  const createAssessment = useCallback((values: AssessmentInput) => create(pickInput(values)), [create])
  const updateAssessment = useCallback((id: number, values: AssessmentInput) => update(id, pickInput(values)), [update])

  // Duplique les assessments sélectionnés sous le nom « Copy of … » ; renvoie les ids des copies
  const copyAssessments = useCallback(
    (ids: number[]) =>
      assessments.filter((a) => ids.includes(a.id)).map((a) => create({ ...pickInput(a), name: `Copy of ${a.name}` })),
    [assessments, create],
  )

  const value = useMemo(
    () => ({ assessments, createAssessment, updateAssessment, deleteAssessments: remove, copyAssessments }),
    [assessments, createAssessment, updateAssessment, remove, copyAssessments],
  )

  return <AssessmentsContext.Provider value={value}>{children}</AssessmentsContext.Provider>
}
