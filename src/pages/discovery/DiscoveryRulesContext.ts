import { createContext } from 'react'

import type { ControlField, ControlValue } from './controlRulesData'

export interface DiscoveryRulesContextValue {
  controlFields: ControlField[]
  createControlField: (values: Omit<ControlField, 'id'>) => number
  updateControlField: (id: number, values: Partial<Omit<ControlField, 'id'>>) => void
  deleteControlFields: (ids: number[]) => void
  controlValues: ControlValue[]
  createControlValue: (values: Omit<ControlValue, 'id'>) => number
  updateControlValue: (id: number, values: Partial<Omit<ControlValue, 'id'>>) => void
  deleteControlValues: (ids: number[]) => void
}

export const DiscoveryRulesContext = createContext<DiscoveryRulesContextValue | null>(null)
