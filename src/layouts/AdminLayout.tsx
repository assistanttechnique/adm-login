import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { AdminDataProviders } from './AdminDataProviders'
import { AdminFooter } from './AdminFooter'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { DASHBOARD_PATH, getBreadcrumb } from './navigation'

// Layout commun à toutes les pages admin : en-tête + barre latérale + contenu + pied de page
export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const breadcrumb = getBreadcrumb(pathname)

  return (
    <div className="flex h-screen flex-col bg-content">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 lg:px-5 lg:py-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-[17px]">
              <Link to={DASHBOARD_PATH} className="font-semibold text-black hover:text-brand-800">
                Home
              </Link>
              {breadcrumb.map(({ label, path }) => (
                <span key={label} className="flex items-center gap-1.5 text-muted">
                  <span className="font-semibold text-black">/</span>
                  {path ? (
                    <Link to={path} className="font-semibold text-black hover:text-brand-800">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                </span>
              ))}
            </nav>

            {pathname !== DASHBOARD_PATH && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-card-border bg-white px-3 py-1.5 text-xs text-black transition hover:bg-content"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
            )}
          </div>

          <AdminDataProviders>
            <Outlet />
          </AdminDataProviders>
        </main>
      </div>

      <AdminFooter />
    </div>
  )
}
