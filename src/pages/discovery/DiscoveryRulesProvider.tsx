import { useMemo, type ReactNode } from 'react'

import { useCollection } from '../../hooks/useCollection'
import { INITIAL_CONTROL_FIELDS, INITIAL_CONTROL_VALUES } from './controlRulesData'
import { DiscoveryRulesContext } from './DiscoveryRulesContext'

// Control Fields et Control Values partagés (utilisés par les Assessments)
// TODO : remplacer l'état local par les appels API
export function DiscoveryRulesProvider({ children }: { children: ReactNode }) {
  const fields = useCollection(INITIAL_CONTROL_FIELDS)
  const values = useCollection(INITIAL_CONTROL_VALUES)

  const value = useMemo(
    () => ({
      controlFields: fields.items,
      createControlField: fields.create,
      updateControlField: fields.update,
      deleteControlFields: fields.remove,
      controlValues: values.items,
      createControlValue: values.create,
      updateControlValue: values.update,
      deleteControlValues: values.remove,
    }),
    [fields.items, fields.create, fields.update, fields.remove, values.items, values.create, values.update, values.remove],
  )

  return <DiscoveryRulesContext.Provider value={value}>{children}</DiscoveryRulesContext.Provider>
}
