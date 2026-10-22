import { createContext } from 'react'

import type { MaskingConfiguration, SavedMaskingConfiguration } from './maskingData'

export interface MaskingConfigurationsContextValue {
  configurations: SavedMaskingConfiguration[]
  saveConfiguration: (values: MaskingConfiguration, id?: number) => number
}

export const MaskingConfigurationsContext = createContext<MaskingConfigurationsContextValue | null>(null)
