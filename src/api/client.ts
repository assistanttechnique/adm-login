const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const ACCESS_KEY = 'adm.access'
const REFRESH_KEY = 'adm.refresh'

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    super(`Erreur API ${status}`)
    this.status = status
    this.data = data
  }
}

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

async function request(path: string, init: RequestInit, withAuth: boolean): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')

  const access = tokenStorage.getAccess()
  if (withAuth && access) headers.set('Authorization', `Bearer ${access}`)

  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}

// Renouvelle le token d'accès avec le refresh token ; renvoie false si la session est expirée
async function refreshAccessToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return false

  const response = await request('/auth/refresh/', { method: 'POST', body: JSON.stringify({ refresh }) }, false)
  if (!response.ok) return false

  const data = (await response.json()) as { access: string; refresh?: string }
  tokenStorage.set(data.access, data.refresh)
  return true
}

export async function apiFetch<T>(
  path: string,
  { withAuth = true, ...init }: RequestInit & { withAuth?: boolean } = {},
): Promise<T> {
  let response = await request(path, init, withAuth)

  if (response.status === 401 && withAuth && (await refreshAccessToken())) {
    response = await request(path, init, withAuth)
  }

  const data: unknown = response.status === 204 || response.status === 205 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data as T
}
