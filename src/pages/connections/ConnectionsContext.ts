import { createContext } from 'react'

import type { Connection, ConnectionInput } from './connectionsData'

export interface ConnectionsContextValue {
  connections: Connection[]
  createConnection: (values: ConnectionInput) => void
  updateConnection: (id: number, values: ConnectionInput) => void
  deleteConnection: (id: number) => void
}

export const ConnectionsContext = createContext<ConnectionsContextValue | null>(null)
