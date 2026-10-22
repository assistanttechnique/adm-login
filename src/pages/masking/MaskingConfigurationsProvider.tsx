import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import { MaskingConfigurationsContext } from './MaskingConfigurationsContext'
import type { MaskingConfiguration, SavedMaskingConfiguration } from './maskingData'

// Configurations de masquage partagées (utilisées par les projets)
// TODO : remplacer l'état local par les appels API
export function MaskingConfigurationsProvider({ children }: { children: ReactNode }) {
  const [configurations, setConfigurations] = useState<SavedMaskingConfiguration[]>([])
  const nextId = useRef(1)

  // Crée la configuration, ou la met à jour si un id est fourni ; renvoie son id
  const saveConfiguration = useCallback((values: MaskingConfiguration, id?: number) => {
    if (id !== undefined) {
      setConfigurations((list) => list.map((c) => (c.id === id ? { ...values, id } : c)))
      return id
    }
    const newId = nextId.current++
    setConfigurations((list) => [...list, { ...values, id: newId }])
    return newId
  }, [])

  const value = useMemo(() => ({ configurations, saveConfiguration }), [configurations, saveConfiguration])

  return <MaskingConfigurationsContext.Provider value={value}>{children}</MaskingConfigurationsContext.Provider>
}
