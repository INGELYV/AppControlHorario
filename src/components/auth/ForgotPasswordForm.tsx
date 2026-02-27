import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setError(''); setLoading(true);
        try { await resetPassword(email); setSent(true); }
        catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    if (sent) return (
        <div className="auth-container"><div className="auth-card">
            <div className="auth-header">
                <div className="auth-logo"><div className="auth-logo-icon auth-logo-icon--success"><CheckCircle size={28} /></div></div>
                <h1 className="auth-title">¡Email Enviado!</h1>
                <p className="auth-subtitle">Revisa tu bandeja de entrada en <strong>{email}</strong></p>
            </div>
            <Link to="/login" className="btn btn-primary btn-full">Volver al Login</Link>
        </div></div>
    );

    return (
        <div className="auth-container"><div className="auth-card">
            <div className="auth-header">
                <div className="auth-logo"><div className="auth-logo-icon"><Mail size={28} /></div></div>
                <h1 className="auth-title">Recuperar Contraseña</h1>
                <p className="auth-subtitle">Te enviaremos un link para restablecer tu contraseña</p>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error"><p>{error}</p></div>}
                <div className="form-group">
                    <label htmlFor="forgot-email" className="form-label">Email</label>
                    <div className="input-wrapper"><Mail size={18} className="input-icon" /><input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="form-input" required autoComplete="email" /></div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-full">{loading ? <span className="btn-loading"><span className="spinner" />Enviando...</span> : 'Enviar Email de Recuperación'}</button>
            </form>
            <Link to="/login" className="auth-back-link"><ArrowLeft size={16} />Volver al Login</Link>
        </div></div>
    );
}
