import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { NAVIGATION, isLinkActive, isNavGroup, type NavGroup } from './navigation'

const ITEM_CLASS =
  'flex w-full items-center gap-3.5 rounded-md px-2.5 py-2.5 text-base font-medium whitespace-nowrap transition'

function SidebarGroup({ group, expanded, onToggle, onNavigate }: {
  group: NavGroup
  expanded: boolean
  onToggle: () => void
  onNavigate: () => void
}) {
  const Icon = group.icon
  const { pathname } = useLocation()
  // Le groupe est mis en avant s'il est ouvert ou s'il contient la page courante
  const highlighted = expanded || group.children.some((child) => isLinkActive(child, pathname))

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`${ITEM_CLASS} ${highlighted ? 'bg-lilac text-white' : 'text-white hover:bg-white/10'}`}
      >
        <Icon className="size-6 shrink-0" strokeWidth={1.5} />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={`size-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <ul className="mt-2.5 bg-sidebar-sub py-1.5">
          {group.children.map((child) => {
            const ChildIcon = child.icon
            return (
              <li key={child.path}>
                <NavLink
                  to={child.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm whitespace-nowrap transition ${
                    isLinkActive(child, pathname) ? 'text-lilac' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ChildIcon className="size-5 shrink-0" strokeWidth={1.5} />
                  {child.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()

  // Le groupe contenant la page courante est ouvert par défaut
  const [expandedGroup, setExpandedGroup] = useState<string | null>(
    () =>
      NAVIGATION.find((item) => isNavGroup(item) && item.children.some((child) => isLinkActive(child, pathname)))?.label ??
      null,
  )

  return (
    <>
      {/* Voile derrière le menu sur mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] shrink-0 overflow-y-auto bg-night-950 px-5 py-14 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav>
          <ul className="space-y-5">
            {NAVIGATION.map((item) => {
              if (isNavGroup(item)) {
                return (
                  <SidebarGroup
                    key={item.label}
                    group={item}
                    expanded={expandedGroup === item.label}
                    onToggle={() => setExpandedGroup((current) => (current === item.label ? null : item.label))}
                    onNavigate={onClose}
                  />
                )
              }

              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${ITEM_CLASS} ${isActive ? 'bg-lilac text-white' : 'text-white hover:bg-white/10'}`
                    }
                  >
                    <Icon className="size-6 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
