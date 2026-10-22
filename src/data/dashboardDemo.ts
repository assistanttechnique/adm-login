// Données de démonstration reprises de la maquette.
// TODO : remplacer par les appels à l'API quand les endpoints du dashboard existeront.

export const dashboardDemo = {
  serverLoad: { queueLength: 0, queueCapacity: 5 },
  activeProjects: 0,
  activeConnections: { current: 0, max: 5 },
  lastRunName: 'DEMO5 DC2',
  discovery: [
    { label: 'Number Of Sensitive Data', value: 65, color: 'var(--color-night-950)' },
    { label: 'Number Of Insensitive Data', value: 35, color: 'var(--color-lilac)' },
  ],
  detailedDiscovery: [
    { label: 'Marked As Sensitive', value: 82, color: 'var(--color-night-950)' },
    { label: 'Scan Field Sensitive', value: 45, color: 'var(--color-lilac)' },
    { label: 'Scan Valued Sensitive', value: 18, color: '#b38bf6' },
  ],
  lastRunProjects: [{ name: 'CWB-Mask Link Project', date: '2026-10-20', time: '01:13:30' }],
}

export interface ChartDatum {
  label: string
  value: number
  color: string
}
