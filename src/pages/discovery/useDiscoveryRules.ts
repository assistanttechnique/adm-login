import { useContext } from 'react'

import { DiscoveryRulesContext } from './DiscoveryRulesContext'

export function useDiscoveryRules() {
  const context = useContext(DiscoveryRulesContext)
  if (!context) throw new Error('useDiscoveryRules doit être utilisé dans un DiscoveryRulesProvider')
  return context
}
