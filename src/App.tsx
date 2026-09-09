import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toast } from './components/ui/Toast';

// Public Auth Pages (Official Gov Style)
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LandingPage } from './pages/public/LandingPage';
import { DemoModeBanner } from './components/common/DemoModeBanner';

// Business Pages
import { AssessmentPage } from './pages/business/AssessmentPage';
import { DashboardPage } from './pages/business/DashboardPage';
import { ProfilePage } from './pages/business/ProfilePage';
import { ApprovalsPage } from './pages/business/ApprovalsPage';
import { ApprovalDetailPage } from './pages/business/ApprovalDetailPage';
import { DocumentsPage } from './pages/business/DocumentsPage';
import { OnboardingDocumentsPage } from './pages/business/OnboardingDocumentsPage';
import { RisksPage } from './pages/business/RisksPage';
import { SupportPage } from './pages/business/SupportPage';
import { CompliancePage } from './pages/business/CompliancePage';
import { CopilotPage } from './pages/business/CopilotPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminApplicationDetailPage } from './pages/admin/AdminApplicationDetailPage';
import { AdminApprovalsPage } from './pages/admin/AdminApprovalsPage';
import { AdminRisksPage } from './pages/admin/AdminRisksPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminDependenciesPage } from './pages/admin/AdminDependenciesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminCompliancePage } from './pages/admin/AdminCompliancePage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Root gatekeeper: renders LandingPage if not logged in; redirects to dashboard if logged in
const RootGatekeeper: React.FC = () => {
  const { user, role } = useApp();
  if (!user) {
    return <LandingPage />;
  }
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
};

// Login gatekeeper: renders LoginPage if not logged in; redirects to dashboard if logged in
const LoginGatekeeper: React.FC = () => {
  const { user, role } = useApp();
  if (!user) {
    return <LoginPage />;
  }
  return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
};

// Protected Route for Business Users
const BusinessRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, role } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (role !== 'business') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

// Protected Route for Admin Users
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, role } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <>
      <DemoModeBanner />
      <Toast message={toastMessage} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootGatekeeper />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginGatekeeper />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />

        {/* Business User Portal */}
        <Route path="/dashboard" element={<BusinessRoute><DashboardPage /></BusinessRoute>} />
        <Route path="/profile" element={<BusinessRoute><ProfilePage /></BusinessRoute>} />
        <Route path="/approvals" element={<BusinessRoute><ApprovalsPage /></BusinessRoute>} />
        <Route path="/approvals/:id" element={<BusinessRoute><ApprovalDetailPage /></BusinessRoute>} />
        <Route path="/documents" element={<BusinessRoute><DocumentsPage /></BusinessRoute>} />
        <Route path="/onboarding/documents" element={<BusinessRoute><OnboardingDocumentsPage /></BusinessRoute>} />
        <Route path="/documents-checklist" element={<BusinessRoute><OnboardingDocumentsPage /></BusinessRoute>} />
        <Route path="/risks" element={<BusinessRoute><RisksPage /></BusinessRoute>} />
        <Route path="/support" element={<BusinessRoute><SupportPage /></BusinessRoute>} />
        <Route path="/compliance" element={<BusinessRoute><CompliancePage /></BusinessRoute>} />
        <Route path="/copilot" element={<BusinessRoute><CopilotPage /></BusinessRoute>} />

        {/* Department Admin Portal (Only Opens After Admin Login) */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><AdminApplicationsPage /></AdminRoute>} />
        <Route path="/admin/applications/:id" element={<AdminRoute><AdminApplicationDetailPage /></AdminRoute>} />
        <Route path="/admin/approvals" element={<AdminRoute><AdminApprovalsPage /></AdminRoute>} />
        <Route path="/admin/risks" element={<AdminRoute><AdminRisksPage /></AdminRoute>} />
        <Route path="/admin/documents" element={<AdminRoute><AdminDocumentsPage /></AdminRoute>} />
        <Route path="/admin/departments" element={<AdminRoute><AdminDepartmentsPage /></AdminRoute>} />
        <Route path="/admin/dependencies" element={<AdminRoute><AdminDependenciesPage /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
        <Route path="/admin/support" element={<AdminRoute><AdminSupportPage /></AdminRoute>} />
        <Route path="/admin/compliance" element={<AdminRoute><AdminCompliancePage /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
