import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './auth/AuthProvider'
import { RequireAdmin } from './auth/RequireAdmin'
import AdminLayout from './layouts/AdminLayout'
import {
  ASSESSMENTS_PATH,
  DASHBOARD_PATH,
  DISCOVERY_CONFIGURATIONS_PATH,
  NAV_LINKS,
  PROJECTS_LIST_PATH,
} from './layouts/navigation'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'
import AuditLogsPage from './pages/admin/AuditLogsPage'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import ConnectionsPage from './pages/connections/ConnectionsPage'
import AssessmentEditPage from './pages/discovery/AssessmentEditPage'
import AssessmentsPage from './pages/discovery/AssessmentsPage'
import ControlFieldsPage from './pages/discovery/ControlFieldsPage'
import ControlValuesPage from './pages/discovery/ControlValuesPage'
import DiscoveryConfigurationPage from './pages/discovery/DiscoveryConfigurationPage'
import DiscoveryConfigurationsListPage from './pages/discovery/DiscoveryConfigurationsListPage'
import MaskingConfigurationPage from './pages/masking/MaskingConfigurationPage'
import ProjectEditPage from './pages/projects/ProjectEditPage'
import ProjectsListPage from './pages/projects/ProjectsListPage'

// Pages déjà développées ; les autres entrées du menu affichent une page provisoire
const PAGES: Record<string, ReactNode> = {
  [DASHBOARD_PATH]: <AdminDashboard />,
  '/admin/connections': <ConnectionsPage />,
  '/admin/discovery/control-fields': <ControlFieldsPage />,
  '/admin/discovery/control-values': <ControlValuesPage />,
  [ASSESSMENTS_PATH]: <AssessmentsPage />,
  [DISCOVERY_CONFIGURATIONS_PATH]: <DiscoveryConfigurationsListPage />,
  '/admin/masking-configurations': <MaskingConfigurationPage />,
  [PROJECTS_LIST_PATH]: <ProjectsListPage />,
  '/admin/administration/users': <ManageUsersPage />,
  '/admin/administration/audit-logs': <AuditLogsPage />,
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Toutes les pages admin partagent le même layout (en-tête + barre latérale) */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to={DASHBOARD_PATH} replace />} />
            {NAV_LINKS.map(({ path, label }) => (
              <Route key={path} path={path} element={PAGES[path] ?? <PlaceholderPage title={label} />} />
            ))}
            {/* Pages hors menu : création et modification (projets, assessments, configurations de découverte) */}
            <Route path="/admin/projects/new" element={<ProjectEditPage />} />
            <Route path="/admin/projects/:projectId" element={<ProjectEditPage />} />
            <Route path={`${ASSESSMENTS_PATH}/new`} element={<AssessmentEditPage />} />
            <Route path={`${ASSESSMENTS_PATH}/:assessmentId`} element={<AssessmentEditPage />} />
            <Route path={`${DISCOVERY_CONFIGURATIONS_PATH}/new`} element={<DiscoveryConfigurationPage />} />
            <Route path={`${DISCOVERY_CONFIGURATIONS_PATH}/:configurationId`} element={<DiscoveryConfigurationPage />} />
          </Route>

          <Route path="*" element={<Navigate to={DASHBOARD_PATH} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
