import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Ferme le menu au clic en dehors
  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full py-1 pr-1 pl-1 transition hover:bg-content"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-night-950 text-lg font-semibold text-white uppercase">
          {user.full_name.charAt(0)}
        </span>
        <span className="hidden text-[15px] font-medium text-black sm:inline">{user.full_name}</span>
        <ChevronDown className={`size-4 text-black transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-card-border bg-white shadow-lg">
          <div className="border-b border-card-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-black">{user.full_name}</p>
            <p className="truncate text-xs text-muted">{user.email || user.username}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-ink transition hover:bg-content"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="relative z-30 flex h-[70px] shrink-0 items-center gap-4 border-b-2 border-night-950 bg-white px-4 lg:px-11">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="rounded-md p-1.5 text-night-950 transition hover:bg-content lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      <img src="/accutive-logo.png" alt="Accutive Security" className="h-9 w-auto opacity-80 sm:h-10" />
      <p className="hidden text-[15px] font-medium text-black md:ml-[70px] md:block">
        Data Discovery and Masking Platform
      </p>

      <div className="ml-auto flex items-center gap-4">
        <button type="button" aria-label="Notifications" className="rounded-full p-2 text-muted transition hover:bg-content">
          <Bell className="size-5" />
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
