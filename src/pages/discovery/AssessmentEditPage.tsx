import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { DualListBox } from '../../components/DualListBox'
import { StatusMessage } from '../../components/ListPage'
import { LABEL_CLASS, TEXT_FIELD_CLASS } from '../../components/formStyles'
import { ASSESSMENTS_PATH } from '../../layouts/navigation'
import { EMPTY_ASSESSMENT, type Assessment, type AssessmentInput } from './assessmentsData'
import { useAssessments } from './useAssessments'
import { useDiscoveryRules } from './useDiscoveryRules'

const TABS = [
  { id: 'values', label: 'Control Values' },
  { id: 'fields', label: 'Control Fields' },
] as const

type TabId = (typeof TABS)[number]['id']
type Feedback = { type: 'success' | 'error'; text: string } | null

const BUTTON_CLASS = 'rounded-lg px-8 py-3 font-semibold transition'

function AssessmentForm({ assessment }: { assessment?: Assessment }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { assessments, createAssessment, updateAssessment, copyAssessments } = useAssessments()
  const { controlFields, controlValues } = useDiscoveryRules()
  const [values, setValues] = useState<AssessmentInput>(assessment ?? EMPTY_ASSESSMENT)
  const [tab, setTab] = useState<TabId>('values')
  // Message transmis après une création ou une copie (redirection vers la fiche)
  const [feedback, setFeedback] = useState<Feedback>(() => {
    const state = location.state as { message?: string } | null
    return state?.message ? { type: 'success', text: state.message } : null
  })

  function update<K extends keyof AssessmentInput>(field: K, value: AssessmentInput[K]) {
    setValues((v) => ({ ...v, [field]: value }))
    setFeedback(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = values.name.trim()
    if (!name) return setFeedback({ type: 'error', text: 'Name is required.' })
    if (assessments.some((a) => a.id !== assessment?.id && a.name.toLowerCase() === name.toLowerCase())) {
      return setFeedback({ type: 'error', text: 'An assessment with this name already exists.' })
    }
    const cleaned = { ...values, name, description: values.description.trim() }
    if (assessment) {
      updateAssessment(assessment.id, cleaned)
      setFeedback({ type: 'success', text: 'Assessment updated.' })
    } else {
      const id = createAssessment(cleaned)
      navigate(`${ASSESSMENTS_PATH}/${id}`, { replace: true, state: { message: 'Assessment created.' } })
    }
  }

  function handleCopy() {
    if (!assessment) return
    const [copyId] = copyAssessments([assessment.id])
    navigate(`${ASSESSMENTS_PATH}/${copyId}`, { state: { message: `Copy of "${assessment.name}" created.` } })
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card sm:p-[30px]">
      <h1 className="bg-night-950 px-6 py-5 text-[15px] font-bold text-white">{assessment ? 'Edit Assessment' : 'Create Assessment'}</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
        <div>
          <label htmlFor="assessment-name" className={LABEL_CLASS}>
            Name*
          </label>
          <input id="assessment-name" value={values.name} onChange={(e) => update('name', e.target.value)} className={`${TEXT_FIELD_CLASS} h-12`} />
        </div>
        <div>
          <label htmlFor="assessment-description" className={LABEL_CLASS}>
            Description
          </label>
          <input
            id="assessment-description"
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${TEXT_FIELD_CLASS} h-12`}
          />
        </div>

        <div>
          <div role="tablist" aria-label="Assessment rules" className="flex gap-1 border-b border-card-border">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-t-md px-5 py-3 text-[13px] font-bold text-black transition ${
                  tab === id ? 'bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)]' : 'bg-[#ececee] hover:bg-[#e2e2e6]'
                }`}
              >
                {label} ({(id === 'values' ? values.controlValueIds : values.controlFieldIds).length})
              </button>
            ))}
          </div>
          <div role="tabpanel" className="pt-5">
            {tab === 'values' ? (
              <DualListBox
                key="values"
                name="Control Values"
                options={controlValues.map((v) => ({ id: v.id, label: v.name }))}
                selected={values.controlValueIds}
                onChange={(ids) => update('controlValueIds', ids)}
              />
            ) : (
              <DualListBox
                key="fields"
                name="Control Fields"
                options={controlFields.map((f) => ({ id: f.id, label: f.name }))}
                selected={values.controlFieldIds}
                onChange={(ids) => update('controlFieldIds', ids)}
              />
            )}
          </div>
        </div>

        {feedback && <StatusMessage type={feedback.type}>{feedback.text}</StatusMessage>}

        <div className="flex flex-wrap justify-end gap-3">
          {assessment && (
            <button type="button" onClick={handleCopy} className={`${BUTTON_CLASS} border-2 border-night-950 text-night-950 hover:bg-content`}>
              Copy Assessment
            </button>
          )}
          <button type="submit" className={`${BUTTON_CLASS} bg-night-950 text-white hover:bg-brand-800`}>
            {assessment ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Fiche assessment : création (/new) ou modification (/:assessmentId), avec ses règles de découverte
export default function AssessmentEditPage() {
  const { assessmentId } = useParams()
  const { assessments } = useAssessments()

  if (!assessmentId) return <AssessmentForm key="new" />

  const assessment = assessments.find((a) => a.id === Number(assessmentId))
  if (!assessment) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-card">
        <p className="text-lg font-semibold text-black">Assessment not found.</p>
        <Link to={ASSESSMENTS_PATH} className="mt-3 inline-block text-sm font-semibold text-accent-600 hover:underline">
          Back to the assessment list
        </Link>
      </div>
    )
  }

  return <AssessmentForm key={assessment.id} assessment={assessment} />
}
