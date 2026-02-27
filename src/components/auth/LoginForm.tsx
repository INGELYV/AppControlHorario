import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setError(''); setLoading(true);
        try { await signIn(email, password); navigate('/'); }
        catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo"><div className="auth-logo-icon"><LogIn size={28} /></div></div>
                    <h1 className="auth-title">Bienvenido de vuelta</h1>
                    <p className="auth-subtitle">Inicia sesión para continuar</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error"><p>{error}</p></div>}
                    <div className="form-group">
                        <label htmlFor="login-email" className="form-label">Email</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="form-input" required autoComplete="email" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password" className="form-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="form-input" required minLength={8} autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-action" aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-actions-row"><Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link></div>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                        {loading ? <span className="btn-loading"><span className="spinner" />Iniciando sesión...</span> : 'Iniciar Sesión'}
                    </button>
                </form>
                <p className="auth-footer">¿No tienes cuenta? <Link to="/register" className="auth-link">Crear cuenta</Link></p>
            </div>
        </div>
    );
}
