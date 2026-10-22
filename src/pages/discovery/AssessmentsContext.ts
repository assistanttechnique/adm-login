import { createContext } from 'react'

import type { Assessment, AssessmentInput } from './assessmentsData'

export interface AssessmentsContextValue {
  assessments: Assessment[]
  createAssessment: (values: AssessmentInput) => number
  updateAssessment: (id: number, values: AssessmentInput) => void
  deleteAssessments: (ids: number[]) => void
  copyAssessments: (ids: number[]) => number[]
}

export const AssessmentsContext = createContext<AssessmentsContextValue | null>(null)
