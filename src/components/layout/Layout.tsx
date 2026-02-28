import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Clock, BarChart3, User, LogOut, Menu, X, Table } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/history', label: 'Historial', icon: <Clock size={20} /> },
    { path: '/reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
    { path: '/profile', label: 'Perfil', icon: <User size={20} /> },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const { profile, signOut, isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    let navItems = [...NAV_ITEMS];
    if (isAdmin) {
        // Para administradores, mostrar SOLO herramientas de administración
        navItems = [
            { path: '/admin', label: 'Dashboard Admin', icon: <LayoutDashboard size={20} className="text-accent" /> },
            { path: '/admin/reports', label: 'Reportes Admin', icon: <BarChart3 size={20} className="text-accent" /> },
            { path: '/admin/table', label: 'Tabla Maestra', icon: <Table size={20} className="text-accent" /> },
            { path: '/profile', label: 'Mi Perfil (Admin)', icon: <User size={20} /> }
        ];
    }

    async function handleLogout() { if (window.confirm('¿Deseas cerrar sesión?')) await signOut(); }

    return (
        <div className="app-layout">
            <header className="app-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-icon mobile-menu-btn" aria-label="Menú">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="header-brand"><Clock size={24} className="brand-icon" /><span className="brand-name">Control Horario</span></div>
                <div className="header-user"><div className="user-avatar">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div></div>
            </header>
            <aside className={`app-sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar-header"><Clock size={28} className="brand-icon" /><span className="brand-name">Control Horario</span></div>
                <div className="sidebar-user">
                    <div className="user-avatar user-avatar--lg">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{profile?.full_name || 'Usuario'}</span>
                        <span className="user-role">{isAdmin ? 'Administrador' : 'Empleado'}</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} end={item.path === '/'}>
                            {item.icon}<span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer"><button onClick={handleLogout} className="nav-item nav-item--logout"><LogOut size={20} /><span>Cerrar Sesión</span></button></div>
            </aside>
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
            <main className="app-main">{children}</main>
        </div>
    );
}
