import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/date'
import { ConnectionsContext } from './ConnectionsContext'
import { INITIAL_CONNECTIONS, type Connection, type ConnectionInput } from './connectionsData'

// Ne garde que les champs saisissables (évite d'écraser id / modifiedBy avec un objet complet)
const pickInput = ({ name, type, subType, fileShare, description }: ConnectionInput): ConnectionInput => ({
  name,
  type,
  subType,
  fileShare,
  description,
})

// Connexions partagées entre les pages admin (Connections, Masking Configurations…)
// TODO : remplacer l'état local par les appels API quand le backend gérera les connexions
export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS)
  const username = user?.username ?? ''

  // Champs mis à jour automatiquement à chaque création / modification
  const stamp = useCallback(() => ({ modifiedBy: username, modifiedDate: formatDateTime(new Date()) }), [username])

  const createConnection = useCallback(
    (values: ConnectionInput) =>
      setConnections((list) => [
        ...list,
        { id: Math.max(0, ...list.map((c) => c.id)) + 1, ...pickInput(values), ...stamp() },
      ]),
    [stamp],
  )

  const updateConnection = useCallback(
    (id: number, values: ConnectionInput) =>
      setConnections((list) => list.map((c) => (c.id === id ? { ...c, ...pickInput(values), ...stamp() } : c))),
    [stamp],
  )

  const deleteConnection = useCallback((id: number) => setConnections((list) => list.filter((c) => c.id !== id)), [])

  const value = useMemo(
    () => ({ connections, createConnection, updateConnection, deleteConnection }),
    [connections, createConnection, updateConnection, deleteConnection],
  )

  return <ConnectionsContext.Provider value={value}>{children}</ConnectionsContext.Provider>
}
