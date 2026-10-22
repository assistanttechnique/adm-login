export interface Connection {
  id: number
  name: string
  type: string
  subType: string
  fileShare: string
  description: string
  modifiedBy: string
  modifiedDate: string
}

export type ConnectionInput = Pick<Connection, 'name' | 'type' | 'subType' | 'fileShare' | 'description'>

// Sous-types proposés pour chaque type de connexion (ceux visibles sur la maquette)
export const CONNECTION_TYPES: Record<string, string[]> = {
  Relational: ['SQL Server', 'MySQL', 'PostgreSQL', 'DB2'],
  'Flat File': ['Delimited'],
}

const row = (id: number, name: string, type: string, subType: string, modifiedDate: string): Connection => ({
  id,
  name,
  type,
  subType,
  fileShare: '',
  description: '',
  modifiedBy: 'admin',
  modifiedDate,
})

// Données de départ reprises de la maquette (gérées uniquement côté front pour l'instant)
export const INITIAL_CONNECTIONS: Connection[] = [
  row(1, 'SQLServer T', 'Relational', 'SQL Server', '2025-03-20 21:35:12'),
  row(2, 'MySQL Source', 'Relational', 'MySQL', '2025-01-17 13:42:08'),
  row(3, 'MySQL Destination', 'Relational', 'MySQL', '2025-02-20 16:56:20'),
  row(4, 'Postgresql ML Demo', 'Relational', 'PostgreSQL', '2025-04-11 22:00:14'),
  row(5, 'Postgresql Destination', 'Relational', 'PostgreSQL', '2025-02-17 22:53:46'),
  row(6, 'SQL Server Source', 'Relational', 'SQL Server', '2025-01-17 15:55:21'),
  row(7, 'SQL Server Destination', 'Relational', 'SQL Server', '2025-01-17 15:57:33'),
  row(8, 'DB2 source', 'Relational', 'DB2', '2025-01-30 23:53:51'),
  row(9, 'DB2 Destination', 'Relational', 'DB2', '2025-01-30 23:55:22'),
  row(10, 'Postgresql T', 'Relational', 'PostgreSQL', '2025-03-27 17:13:50'),
  row(11, 'MySQL In-Place Masking', 'Relational', 'MySQL', '2025-02-20 17:51:01'),
  row(12, 'Discovery test', 'Relational', 'PostgreSQL', '2025-04-03 15:02:00'),
  row(13, 'ADM CSV', 'Flat File', 'Delimited', '2025-04-28 20:21:23'),
]
