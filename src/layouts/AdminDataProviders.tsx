import type { ReactNode } from 'react'

import { ConnectionsProvider } from '../pages/connections/ConnectionsProvider'
import { AssessmentsProvider } from '../pages/discovery/AssessmentsProvider'
import { DiscoveryConfigurationsProvider } from '../pages/discovery/DiscoveryConfigurationsProvider'
import { DiscoveryRulesProvider } from '../pages/discovery/DiscoveryRulesProvider'
import { MaskingConfigurationsProvider } from '../pages/masking/MaskingConfigurationsProvider'
import { ProjectsProvider } from '../pages/projects/ProjectsProvider'

// Données partagées entre les pages admin (état local en attendant l'API)
export function AdminDataProviders({ children }: { children: ReactNode }) {
  return (
    <ConnectionsProvider>
      <DiscoveryRulesProvider>
      <AssessmentsProvider>
        <DiscoveryConfigurationsProvider>
          <MaskingConfigurationsProvider>
            <ProjectsProvider>{children}</ProjectsProvider>
          </MaskingConfigurationsProvider>
        </DiscoveryConfigurationsProvider>
      </AssessmentsProvider>
      </DiscoveryRulesProvider>
    </ConnectionsProvider>
  )
}
