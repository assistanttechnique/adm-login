import { useContext } from 'react'

import { MaskingConfigurationsContext } from './MaskingConfigurationsContext'

export function useMaskingConfigurations() {
  const context = useContext(MaskingConfigurationsContext)
  if (!context) throw new Error('useMaskingConfigurations doit être utilisé dans un MaskingConfigurationsProvider')
  return context
}
