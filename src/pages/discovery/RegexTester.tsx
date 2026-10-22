import { useState } from 'react'

import { MODAL_FIELD_CLASS, MODAL_LABEL_CLASS } from '../../components/formStyles'
import { regexError, regexMatches } from '../../utils/regex'

// Petit testeur : vérifie en direct si un exemple correspond à l'expression régulière saisie
export function RegexTester({ id, pattern, placeholder }: { id: string; pattern: string; placeholder: string }) {
  const [sample, setSample] = useState('')
  const invalid = pattern !== '' && regexError(pattern) !== null

  return (
    <div>
      <label htmlFor={id} className={MODAL_LABEL_CLASS}>
        Test the expression
      </label>
      <div className="flex items-center gap-3">
        <input id={id} value={sample} onChange={(e) => setSample(e.target.value)} placeholder={placeholder} className={MODAL_FIELD_CLASS} />
        {sample && !invalid && pattern && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              regexMatches(pattern, sample) ? 'bg-green-50 text-green-800' : 'bg-content text-muted'
            }`}
          >
            {regexMatches(pattern, sample) ? 'Match' : 'No match'}
          </span>
        )}
      </div>
    </div>
  )
}
