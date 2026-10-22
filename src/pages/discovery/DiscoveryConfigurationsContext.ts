import { createContext } from 'react'

import type { DiscoveryConfiguration, SavedDiscoveryConfiguration } from './discoveryConfigurationsData'

export interface DiscoveryConfigurationsContextValue {
  configurations: SavedDiscoveryConfiguration[]
  saveConfiguration: (values: DiscoveryConfiguration, id?: number) => number
  deleteConfigurations: (ids: number[]) => void
  requestScan: (id: number) => void
}

export const DiscoveryConfigurationsContext = createContext<DiscoveryConfigurationsContextValue | null>(null)
