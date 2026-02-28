import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TimeTrackingProvider } from '@/contexts/TimeTrackingContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const HistoryPage = lazy(() => import('@/pages/History'));
const ReportsPage = lazy(() => import('@/pages/Reports'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboard'));
const AdminReportsPage = lazy(() => import('@/pages/AdminReports'));

const PageLoader = () => <div className="protected-route-loader"><div className="loader-spinner" /></div>;

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <TimeTrackingProvider>
        <Layout>{children}</Layout>
      </TimeTrackingProvider>
    </ProtectedRoute>
  );
}

function AdminPage({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <ProtectedPage>{children}</ProtectedPage>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
        <Route path="/history" element={<ProtectedPage><HistoryPage /></ProtectedPage>} />
        <Route path="/reports" element={<ProtectedPage><ReportsPage /></ProtectedPage>} />
        <Route path="/profile" element={<ProtectedPage><ProfilePage /></ProtectedPage>} />
        <Route path="/admin" element={<AdminPage><AdminDashboardPage /></AdminPage>} />
        <Route path="/admin/reports" element={<AdminPage><AdminReportsPage /></AdminPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
