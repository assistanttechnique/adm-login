export type SourceMode = 'source' | 'discovery'

export interface MaskingConfiguration {
  name: string
  description: string
  sourceMode: SourceMode
  source: string
  destination: string
  tableOperation: string
  disableConstraints: boolean
  applyFieldOperator: boolean
  // Mode « Source Connection » (vu dans la vidéo ADM récente)
  singleThreadDestination: boolean
}

export interface SavedMaskingConfiguration extends MaskingConfiguration {
  id: number
}

export const EMPTY_MASKING_CONFIGURATION: MaskingConfiguration = {
  name: '',
  description: '',
  sourceMode: 'discovery',
  source: '',
  destination: '',
  tableOperation: '',
  disableConstraints: false,
  applyFieldOperator: false,
  singleThreadDestination: false,
}

// Opérations proposées sur les maquettes (COPY vue dans la vidéo ADM récente)
export const TABLE_OPERATIONS = ['NOTHING', 'TRUNCATE', 'DELETE', 'COPY']

// Textes d'aide des pastilles « ? » (à ajuster avec la documentation ADM)
export const HELP = {
  destination: 'Connection where the masked data will be written.',
  disableConstraints: 'Temporarily disable database constraints (foreign keys, checks) while masking.',
  applyFieldOperator: 'Apply the field operators defined for each field during masking.',
  singleThreadDestination: 'Write to the destination with a single thread (safer for databases with strict locking).',
}
