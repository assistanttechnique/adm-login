import { useContext } from 'react'

import { DiscoveryConfigurationsContext } from './DiscoveryConfigurationsContext'

export function useDiscoveryConfigurations() {
  const context = useContext(DiscoveryConfigurationsContext)
  if (!context) throw new Error('useDiscoveryConfigurations doit être utilisé dans un DiscoveryConfigurationsProvider')
  return context
}
