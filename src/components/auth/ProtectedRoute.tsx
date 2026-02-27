import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="protected-route-loader"><div className="loader-spinner" /><p>Cargando...</p></div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}
