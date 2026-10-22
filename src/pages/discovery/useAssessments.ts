import { useContext } from 'react'

import { AssessmentsContext } from './AssessmentsContext'

export function useAssessments() {
  const context = useContext(AssessmentsContext)
  if (!context) throw new Error('useAssessments doit être utilisé dans un AssessmentsProvider')
  return context
}
