// Règles de découverte : Control Fields (nom de colonne) et Control Values (contenu des données).
// Structure reprise de la démo officielle ADM v2.1 (« Scan Fields » / « Scan Values »).

export interface ControlField {
  id: number
  name: string
  regularExpression: string
  enabled: boolean
}

export type ScanType = 'REGEXP' | 'GROOVY'

export interface ControlValue {
  id: number
  name: string
  enabled: boolean
  scanType: ScanType
  regularExpression: string
  groovyStaticScript: string
  groovyScript: string
  matchLimit: number
  allowedDataTypes: string[]
  maskingOperator: string
  defaultParameters: string
}

export const SCAN_TYPES: ScanType[] = ['REGEXP', 'GROOVY']

export const DATA_TYPES = ['Boolean', 'Binary', 'LargeObject', 'Literal', 'Number', 'TimeBased']

// Opérateurs déduits des fiches techniques Accutive (« Sample masking operators ») ; « Template » vu dans la démo
export const MASKING_OPERATORS = [
  'Template',
  'First Name',
  'Last Name',
  'Full Name',
  'Address',
  'City / State / Zip',
  'Company Name',
  'Email',
  'Phone Number',
  'SSN',
  'SIN',
  'Credit Card Number',
  'Custom List',
  'Number (preserve digits)',
  'Date (random range)',
]

export const ENABLED_FILTERS = ['Show All', 'Yes', 'No']

// Valeurs lisibles sur la démo (expressions recopiées)
const field = (id: number, name: string, regularExpression: string): ControlField => ({ id, name, regularExpression, enabled: true })

export const INITIAL_CONTROL_FIELDS: ControlField[] = [
  field(1, 'ssn', '.*(ssn|ssan|sin|soc|security|tax|tid).*$'),
  field(2, 'first name', '.*(first|fname|firstname).*$'),
  field(3, 'middle name', '.*(middle|mname|m_name|middlename).*$'),
  field(4, 'last name', '.*(last|lname|l_name|lastname).*$'),
  field(5, 'full name', '.*(full|fname|f_name).*$'),
  field(6, 'nickname', '.*(nick|nname|n_name).*$'),
  field(7, 'race', '.*(race|eth).*$'),
  field(8, 'marital status', '.*(mar).*$'),
  field(9, 'residential status', '.*(res).*$'),
  field(10, 'dependents', '.*dep.*$'),
  field(11, 'company', '.*company.*$'),
  field(12, 'age', '.*age.*$'),
]

const value = (
  id: number,
  name: string,
  regularExpression: string,
  matchLimit: number,
  maskingOperator: string,
  allowedDataTypes: string[] = ['Literal'],
  enabled = true,
): ControlValue => ({
  id,
  name,
  enabled,
  scanType: 'REGEXP',
  regularExpression,
  groovyStaticScript: '',
  groovyScript: '',
  matchLimit,
  allowedDataTypes,
  maskingOperator,
  defaultParameters: '',
})

// Noms, types et limites repris de la démo ; les expressions sont floues sur la vidéo et ont été réécrites
export const INITIAL_CONTROL_VALUES: ControlValue[] = [
  value(1, 'findTelephoneNumber', '^\\+?1?[\\s.-]?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$', 30, 'Phone Number'),
  value(2, 'findEmail', '^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$', 20, 'Email'),
  value(3, 'findSSN', '^(?!000|666|9\\d{2})\\d{3}-?(?!00)\\d{2}-?(?!0000)\\d{4}$', 40, 'SSN'),
  value(4, 'findSSN1', '^\\d{3}\\s\\d{2}\\s\\d{4}$', 40, 'SSN'),
  value(5, 'findSIN', '^\\d{3}[- ]?\\d{3}[- ]?\\d{3}$', 40, 'SIN'),
  value(6, 'findSIN1', '^[1-9]\\d{8}$', 40, 'SIN', ['Literal', 'Number'], false),
  value(7, 'findURL', '^(https?|ftp)://[^\\s/$.?#].[^\\s]*$', 30, 'Template'),
  value(8, 'findDate1', '^(19|20)\\d{2}[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12]\\d|3[01])$', 30, 'Date (random range)', ['Literal', 'TimeBased']),
  value(9, 'findDate2', '^(0[1-9]|1[012])[-/.](0[1-9]|[12]\\d|3[01])[-/.](19|20)\\d{2}$', 30, 'Date (random range)', ['Literal', 'TimeBased']),
  value(10, 'findDate3', '^(0[1-9]|[12]\\d|3[01])[-/.](0[1-9]|1[012])[-/.](19|20)\\d{2}$', 30, 'Date (random range)', ['Literal', 'TimeBased']),
  {
    ...value(11, 'findBusinessName', '', 30, 'Company Name'),
    scanType: 'GROOVY',
    groovyStaticScript: "def busNames = ['inc', 'llc', 'ltd', 'corp', 'company']",
    groovyScript:
      'boolean match = false\nbusNames.each { name ->\n  if (data.toLowerCase().contains(name)) match = true\n}\nreturn match',
  },
  value(12, 'findAddresses', '^\\d+\\s[A-Za-z]+\\s[A-Za-z]+', 30, 'Address'),
  {
    ...value(13, 'findCreditCardNumber', '', 20, 'Credit Card Number', ['Literal', 'Number']),
    scanType: 'GROOVY',
    groovyStaticScript: "/* Préfixes possibles des cartes */\ndef cardStart = ['34', '37', '4', '51', '52', '53', '54', '55', '6011']",
    groovyScript:
      "def token = data.replaceAll('[^0-9]', '')\nif (!cardStart.any { token.startsWith(it) }) return false\n\n/* Contrôle de Luhn */\nint total = 0\ntoken.reverse().eachWithIndex { ch, index ->\n  int digit = Integer.parseInt(ch)\n  total += (index % 2 == 0) ? digit : [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][digit]\n}\nreturn total % 10 == 0",
  },
]

export function matchesEnabledFilter(enabled: boolean, filter: string): boolean {
  return filter === 'Show All' || (filter === 'Yes') === enabled
}
