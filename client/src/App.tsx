import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CitizenHeader } from './components/CitizenHeader.js';
import { AdminHeader } from './components/AdminHeader.js';
import { AdminSidebar } from './components/AdminSidebar.js';
import { CitizenHome } from './pages/citizen/CitizenHome.js';
import { VoiceReport } from './pages/citizen/VoiceReport.js';
import { ReportSuccess } from './pages/citizen/ReportSuccess.js';
import { TrackReport } from './pages/citizen/TrackReport.js';
import { ServiceDirectory } from './pages/citizen/ServiceDirectory.js';
import { AuthCallback } from './pages/citizen/AuthCallback.js';
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { Dashboard } from './pages/admin/Dashboard.js';
import { CasesList } from './pages/admin/CasesList.js';
import { CaseDetail } from './pages/admin/CaseDetail.js';
import { AnalyticsPage } from './pages/admin/AnalyticsPage.js';
import { AuditLogPage } from './pages/admin/AuditLogPage.js';
import { useAuth } from './context/AuthContext.js';

// Protected Route for Admin
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="text-center py-20 text-slate-400">सत्यापित किया जा रहा है...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Dynamic Header */}
      {isAdminRoute ? <AdminHeader /> : <CitizenHeader />}

      {/* Main Body */}
      {isAdminRoute ? (
        <div className="flex-1 flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <Dashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/cases"
                element={
                  <AdminProtectedRoute>
                    <CasesList />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/cases/:id"
                element={
                  <AdminProtectedRoute>
                    <CaseDetail />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminProtectedRoute>
                    <AnalyticsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/directory"
                element={
                  <AdminProtectedRoute>
                    <ServiceDirectory />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <AdminProtectedRoute>
                    <AuditLogPage />
                  </AdminProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<CitizenHome />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/report" element={<VoiceReport />} />
            <Route path="/report/success" element={<ReportSuccess />} />
            <Route path="/track" element={<TrackReport />} />
            <Route path="/directory" element={<ServiceDirectory />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}

      {/* Discreet Citizen Footer */}
      {!isAdminRoute && (
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
            <span>© 2026-2027 JeevikaSetu (जीविका सेतु) • बिहार बाढ़ आजीविका बहाली मंच</span>
            <span className="text-slate-400">Hack for Social Cause — Viksit Bharat Dialogue 2027</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
