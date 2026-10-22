import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { apiFetch, tokenStorage } from '../api/client'
import { AuthContext, type User } from './AuthContext'

interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => tokenStorage.getAccess() !== null)

  // Au chargement, restaure la session si un token est déjà stocké
  useEffect(() => {
    if (!tokenStorage.getAccess()) return

    apiFetch<User>('/auth/me/')
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await apiFetch<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      withAuth: false,
    })
    tokenStorage.set(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    if (refresh) {
      // La déconnexion locale doit réussir même si le serveur est injoignable
      await apiFetch('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }).catch(() => undefined)
    }
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
