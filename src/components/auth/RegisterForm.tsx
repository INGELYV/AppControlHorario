import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setError('');
        if (fullName.trim().length < 2) { setError('El nombre debe tener al menos 2 caracteres'); return; }
        if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
        setLoading(true);
        try { await signUp(email, password, fullName.trim()); navigate('/'); }
        catch (err) { setError(err instanceof Error ? err.message : 'Error al registrarse'); }
        finally { setLoading(false); }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo"><div className="auth-logo-icon"><UserPlus size={28} /></div></div>
                    <h1 className="auth-title">Crear Cuenta</h1>
                    <p className="auth-subtitle">Regístrate para comenzar</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error"><p>{error}</p></div>}
                    <div className="form-group">
                        <label htmlFor="reg-name" className="form-label">Nombre Completo</label>
                        <div className="input-wrapper"><User size={18} className="input-icon" /><input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre completo" className="form-input" required autoComplete="name" /></div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email" className="form-label">Email</label>
                        <div className="input-wrapper"><Mail size={18} className="input-icon" /><input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="form-input" required autoComplete="email" /></div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-pass" className="form-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input id="reg-pass" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="form-input" required minLength={8} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="input-action">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-confirm" className="form-label">Confirmar Contraseña</label>
                        <div className="input-wrapper"><Lock size={18} className="input-icon" /><input id="reg-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" className="form-input" required minLength={8} autoComplete="new-password" /></div>
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary btn-full">{loading ? <span className="btn-loading"><span className="spinner" />Creando cuenta...</span> : 'Registrarse'}</button>
                </form>
                <p className="auth-footer">¿Ya tienes cuenta? <Link to="/login" className="auth-link">Iniciar Sesión</Link></p>
            </div>
        </div>
    );
}
