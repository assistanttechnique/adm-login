import { useContext } from 'react'

import { ConnectionsContext } from './ConnectionsContext'

export function useConnections() {
  const context = useContext(ConnectionsContext)
  if (!context) throw new Error('useConnections doit être utilisé dans un ConnectionsProvider')
  return context
}
