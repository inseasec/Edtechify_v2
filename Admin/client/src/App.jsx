import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Components/Login'
import ForgotPassword from './Components/ForgotPassword'
import ProtectedRoute from './Components/ProtectedRoute'
import AdminLayout from './Components/AdminLayout'
import Dashboard from './pages/Dashboard'
import PagesCompanyDetails from './pages/PagesCompanyDetails'
import AccountSettings from './pages/AccountSettings'
import InvoiceSettings from './pages/InvoiceSettings'
import AllInvoices from './pages/AllInvoices'
import CareersPage from './pages/CareersPage'
import {
  CareersVideosPlaceholder,
} from './pages/CareersPipelinePlaceholders'
import ApplicantDetails from './pages/ApplicantDetails'
import ChatSupport from './pages/ChatSupport'
import AdminPage from './pages/AdminPage'
import AdminStudents from './pages/AdminStudents'
import UserPanelHome from './pages/UserPanelHome'
import UserPanelAbout from './pages/UserPanelAbout'
import Frontend from './pages/Frontend'
import AuthenticationProviders from './pages/AuthenticationProviders'
import AuthenticationKeys from './pages/AuthenticationKeys'
import AuthenticationSideImages from './pages/AuthenticationSideImages.jsx'
// import Configuration from './pages/Configuration'

function AdminShell() {
  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  )
}

const adminChildRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="admin" element={<AdminPage />} />
    <Route path="clients" element={<AdminStudents />} />
    <Route path="company-details/pages" element={<PagesCompanyDetails />} />
    <Route path="company-details/account-settings" element={<AccountSettings />} />
    <Route path="company-details/invoice-settings" element={<InvoiceSettings />} />
    <Route path="company-details/all-invoices" element={<AllInvoices />} />
    <Route path="careers/videos" element={<CareersVideosPlaceholder />} />
    <Route path="careers/applicant/:applicantId" element={<ApplicantDetails />} />
    <Route path="careers" element={<CareersPage />} />
    <Route path="careers/:section" element={<CareersPage />} />
    <Route path="chat-support" element={<ChatSupport />} />
    <Route path="user-panel" element={<Frontend />}>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<UserPanelHome />} />
      <Route path="about" element={<UserPanelAbout />} />
      <Route path="authentication" element={<Navigate to="authentication/providers" replace />} />
      <Route path="authentication/providers" element={<AuthenticationProviders />} />
      <Route path="authentication/keys" element={<AuthenticationKeys />} />
      <Route path="authentication/side-images" element={<AuthenticationSideImages />} />
    </Route>
    {/* <Route path="configuration" element={<Configuration />} /> */}
  </>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/super-admin" element={<AdminShell />}>
        {adminChildRoutes}
      </Route>
      <Route path="/team-admin" element={<AdminShell />}>
        {adminChildRoutes}
      </Route>
      <Route path="/career" element={<AdminShell />}>
        {adminChildRoutes}
      </Route>

      <Route path="/dashboard" element={<Navigate to="/super-admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
