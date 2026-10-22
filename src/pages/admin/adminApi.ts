import { ApiError, apiFetch } from '../../api/client'
import type { Role } from '../../auth/AuthContext'

export interface ManagedUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: Role
  is_active: boolean
  last_login: string | null
  date_joined: string
}

export type ManagedUserInput = Pick<ManagedUser, 'username' | 'email' | 'first_name' | 'last_name' | 'role' | 'is_active'> & {
  password: string
}

export interface AuditLogFile {
  date: string
  name: string
}

export interface AuditLogEntry {
  id: number
  timestamp: string
  event: string
  message: string
  user: string
  ip_address: string | null
}

export interface AuditLogDay {
  file: string
  valid: boolean
  entries: AuditLogEntry[]
}

const json = (body: unknown) => JSON.stringify(body)

export const usersApi = {
  list: () => apiFetch<ManagedUser[]>('/admin/users/'),
  create: (values: ManagedUserInput) => apiFetch<ManagedUser>('/admin/users/', { method: 'POST', body: json(values) }),
  update: (id: number, values: ManagedUserInput) =>
    apiFetch<ManagedUser>(`/admin/users/${id}/`, { method: 'PATCH', body: json(values) }),
  remove: (id: number) => apiFetch<null>(`/admin/users/${id}/`, { method: 'DELETE' }),
}

export const auditLogsApi = {
  files: () => apiFetch<AuditLogFile[]>('/admin/audit-logs/files/'),
  day: (date: string) => apiFetch<AuditLogDay>(`/admin/audit-logs/?date=${encodeURIComponent(date)}`),
}

// Transforme une erreur de l'API (format DRF : { champ: [messages] }) en messages lisibles
export function apiErrorMessages(error: unknown): string[] {
  if (!(error instanceof ApiError)) return ['Unable to reach the server. Please try again later.']
  if (error.status === 403) return ['You do not have permission to perform this action.']
  const data = error.data
  if (data && typeof data === 'object') {
    const messages = Object.entries(data as Record<string, unknown>).flatMap(([field, value]) => {
      const list = Array.isArray(value) ? value : [value]
      return list.map((message) => (field === 'detail' || field === 'non_field_errors' ? String(message) : `${field}: ${String(message)}`))
    })
    if (messages.length > 0) return messages
  }
  return [`Unexpected error (${error.status}).`]
}
