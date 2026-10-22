export interface DiscoveryConfiguration {
  name: string
  description: string
  sourceConnection: string
  ignoreGroup: string
  scanGroups: string[]
  enableDeepScan: boolean
  examineAllRows: boolean
  scanPrimaryKeys: boolean
  scanForeignKeys: boolean
  rowsToSample: string
}

export interface SavedDiscoveryConfiguration extends DiscoveryConfiguration {
  id: number
  // Date de la dernière demande de scan (vide si jamais scannée)
  lastScanRequest: string
  modifiedBy: string
  modifiedDate: string
}

export const EMPTY_DISCOVERY_CONFIGURATION: DiscoveryConfiguration = {
  name: '',
  description: '',
  sourceConnection: '',
  ignoreGroup: '',
  scanGroups: [],
  enableDeepScan: false,
  examineAllRows: false,
  scanPrimaryKeys: false,
  scanForeignKeys: false,
  rowsToSample: '100',
}

export const ROWS_TO_SAMPLE = ['100', '500', '1000', '5000', '10000']

// TODO : remplacer par les groupes de la page Ignore Groups quand elle existera
export const IGNORE_GROUPS = ['Oracle Source On 10.11.12.79']

// Champs obligatoires (marqués * sur la maquette) ; renvoie la liste des problèmes
export function validateDiscoveryConfiguration(values: DiscoveryConfiguration): string[] {
  const issues: string[] = []
  if (!values.name.trim()) issues.push('Discovery Name is required.')
  if (!values.sourceConnection) issues.push('Source Connection is required.')
  if (values.scanGroups.length === 0) issues.push('Select at least one compliance regulatory scan group.')
  return issues
}

// Configurations de départ reprises des maquettes (listes déroulantes des pages Masking et Projects)
export const INITIAL_DISCOVERY_CONFIGURATIONS: SavedDiscoveryConfiguration[] = [
  'CSV DEMO',
  'Demo Discovery',
  'Test',
  'Transact Discovery',
].map((name, index) => ({
  ...EMPTY_DISCOVERY_CONFIGURATION,
  id: index + 1,
  name,
  lastScanRequest: '',
  // Auteur et date de démonstration
  modifiedBy: 'admin',
  modifiedDate: '2025-01-30 21:16:45',
}))
