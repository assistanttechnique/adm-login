import { useCallback, useMemo, type ReactNode } from 'react'

import { useAuth } from '../../auth/useAuth'
import { useCollection } from '../../hooks/useCollection'
import { formatDateTime } from '../../utils/date'
import { DiscoveryConfigurationsContext } from './DiscoveryConfigurationsContext'
import { INITIAL_DISCOVERY_CONFIGURATIONS, type DiscoveryConfiguration } from './discoveryConfigurationsData'

// Configurations de découverte partagées (utilisées par Masking Configurations et Projects)
// TODO : remplacer l'état local par les appels API
export function DiscoveryConfigurationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { items: configurations, create, update, remove } = useCollection(INITIAL_DISCOVERY_CONFIGURATIONS)
  const username = user?.username ?? ''

  // Crée la configuration, ou la met à jour si un id est fourni ; renvoie son id
  const saveConfiguration = useCallback(
    (values: DiscoveryConfiguration, id?: number) => {
      const stamp = { modifiedBy: username, modifiedDate: formatDateTime(new Date()) }
      if (id !== undefined) {
        update(id, { ...values, ...stamp })
        return id
      }
      return create({ ...values, ...stamp, lastScanRequest: '' })
    },
    [create, update, username],
  )

  // TODO : déclencher le scan réel via l'API ; on mémorise seulement la date de la demande
  const requestScan = useCallback((id: number) => update(id, { lastScanRequest: formatDateTime(new Date()) }), [update])

  const value = useMemo(
    () => ({ configurations, saveConfiguration, deleteConfigurations: remove, requestScan }),
    [configurations, saveConfiguration, remove, requestScan],
  )

  return <DiscoveryConfigurationsContext.Provider value={value}>{children}</DiscoveryConfigurationsContext.Provider>
}
