import type { LucideIcon } from 'lucide-react'
import {
  BrainCircuit,
  BrainCog,
  CalendarClock,
  ClipboardList,
  Database,
  Gauge,
  Globe,
  Layers,
  Monitor,
  Network,
  ScrollText,
  SquareDot,
  UserCog,
  Users,
} from 'lucide-react'

export interface NavLink {
  label: string
  path: string
  icon: LucideIcon
  // URLs supplémentaires pour lesquelles le lien est affiché comme actif
  activePattern?: RegExp
  // Libellé du fil d'Ariane s'il diffère de celui du menu
  title?: string
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

export const DASHBOARD_PATH = '/admin/dashboard'
export const PROJECTS_LIST_PATH = '/admin/projects/list'
export const ASSESSMENTS_PATH = '/admin/discovery/assessments'
export const DISCOVERY_CONFIGURATIONS_PATH = '/admin/discovery/configurations'

// Menu de la barre latérale, commun à toutes les pages admin
export const NAVIGATION: NavItem[] = [
  { label: 'Dashboard', path: DASHBOARD_PATH, icon: Gauge },
  { label: 'Connections', path: '/admin/connections', icon: Network },
  {
    label: 'Discovery',
    icon: Database,
    children: [
      { label: 'Control Fields', path: '/admin/discovery/control-fields', icon: Layers },
      { label: 'Control Values', path: '/admin/discovery/control-values', icon: BrainCog },
      {
        label: 'Assessments',
        path: ASSESSMENTS_PATH,
        icon: ClipboardList,
        title: 'Assessment List',
        activePattern: /^\/admin\/discovery\/assessments\/(new|\d+)$/,
      },
      { label: 'Ignore Fields', path: '/admin/discovery/ignore-fields', icon: SquareDot },
      { label: 'Ignore Tables', path: '/admin/discovery/ignore-tables', icon: SquareDot },
      { label: 'Ignore Groups', path: '/admin/discovery/ignore-groups', icon: SquareDot },
      {
        label: 'Discovery Configurations',
        path: DISCOVERY_CONFIGURATIONS_PATH,
        icon: Globe,
        title: 'Discovery Configurations List',
        activePattern: /^\/admin\/discovery\/configurations\/(new|\d+)$/,
      },
    ],
  },
  { label: 'Masking Configurations', path: '/admin/masking-configurations', icon: Monitor },
  {
    label: 'Projects',
    icon: BrainCircuit,
    children: [
      // Reste actif sur la création et la modification d'un projet
      { label: 'Projects List', path: PROJECTS_LIST_PATH, icon: BrainCircuit, activePattern: /^\/admin\/projects\/(new|\d+)$/ },
      { label: 'Projects Reports', path: '/admin/projects/reports', icon: BrainCircuit },
    ],
  },
  { label: 'Scheduler', path: '/admin/scheduler', icon: CalendarClock },
  {
    label: 'Admin',
    icon: UserCog,
    // Sous-menus vus dans la démo ADM v2.1
    children: [
      { label: 'Manage Users', path: '/admin/administration/users', icon: Users },
      { label: 'Audit Logs', path: '/admin/administration/audit-logs', icon: ScrollText },
    ],
  },
]

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item
}

export function isLinkActive(link: NavLink, pathname: string): boolean {
  return link.path === pathname || Boolean(link.activePattern?.test(pathname))
}

export const NAV_LINKS: NavLink[] = NAVIGATION.flatMap((item) => (isNavGroup(item) ? item.children : [item]))

export interface Crumb {
  label: string
  path?: string
}

// Pages hors menu (formulaires) : fil d'Ariane défini à la main
const EXTRA_BREADCRUMBS: { pattern: RegExp; crumbs: Crumb[] }[] = [
  {
    pattern: /^\/admin\/projects\/new$/,
    crumbs: [{ label: 'Project List', path: PROJECTS_LIST_PATH }, { label: 'Create Project' }],
  },
  {
    pattern: /^\/admin\/projects\/\d+$/,
    crumbs: [{ label: 'Project List', path: PROJECTS_LIST_PATH }, { label: 'Edit Project' }],
  },
  {
    pattern: /^\/admin\/discovery\/assessments\/new$/,
    crumbs: [{ label: 'Discovery' }, { label: 'Assessment List', path: ASSESSMENTS_PATH }, { label: 'Create Assessment' }],
  },
  {
    pattern: /^\/admin\/discovery\/assessments\/\d+$/,
    crumbs: [{ label: 'Discovery' }, { label: 'Assessment List', path: ASSESSMENTS_PATH }, { label: 'Edit Assessment' }],
  },
  {
    pattern: /^\/admin\/discovery\/configurations\/new$/,
    crumbs: [
      { label: 'Discovery' },
      { label: 'Discovery Configurations List', path: DISCOVERY_CONFIGURATIONS_PATH },
      { label: 'Discovery Configuration' },
    ],
  },
  {
    pattern: /^\/admin\/discovery\/configurations\/\d+$/,
    crumbs: [
      { label: 'Discovery' },
      { label: 'Discovery Configurations List', path: DISCOVERY_CONFIGURATIONS_PATH },
      { label: 'Edit Discovery Configuration' },
    ],
  },
]

// Fil d'Ariane (groupe parent éventuel + page) pour une URL donnée
export function getBreadcrumb(pathname: string): Crumb[] {
  for (const item of NAVIGATION) {
    if (isNavGroup(item)) {
      const child = item.children.find((link) => link.path === pathname)
      if (child) return [{ label: item.label }, { label: child.title ?? child.label }]
    } else if (item.path === pathname) {
      return [{ label: item.title ?? item.label }]
    }
  }
  return EXTRA_BREADCRUMBS.find(({ pattern }) => pattern.test(pathname))?.crumbs ?? []
}
