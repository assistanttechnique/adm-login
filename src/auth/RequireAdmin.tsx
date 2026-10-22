import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from './useAuth'

// Protège les pages admin : redirige vers /login si l'utilisateur n'est pas un administrateur connecté
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-800">
        <Loader2 className="size-8 animate-spin text-white" />
      </div>
    )
  }

  if (user?.role !== 'admin') return <Navigate to="/login" replace />

  return children
}
