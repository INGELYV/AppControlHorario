import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Lock, Trash2, Save } from 'lucide-react';

export default function ProfilePage() {
    const { profile, user, updateProfile, updatePassword, signOut } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault(); setProfileErr(''); setProfileMsg(''); setProfileLoading(true);
        try {
            await updateProfile({
                full_name: fullName.trim(),
                marital_status: maritalStatus,
                phone: phone.trim(),
                birth_date: birthDate
            });
            setProfileMsg('Perfil actualizado');
        }
        catch (err) { setProfileErr(err instanceof Error ? err.message : 'Error'); }
        finally { setProfileLoading(false); }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault(); setPasswordErr(''); setPasswordMsg('');
        if (newPassword.length < 8) { setPasswordErr('Mínimo 8 caracteres'); return; }
        if (newPassword !== confirmPassword) { setPasswordErr('Las contraseñas no coinciden'); return; }
        setPasswordLoading(true);
        try { await updatePassword(newPassword); setPasswordMsg('Contraseña actualizada'); setNewPassword(''); setConfirmPassword(''); }
        catch (err) { setPasswordErr(err instanceof Error ? err.message : 'Error'); }
        finally { setPasswordLoading(false); }
    }

    async function handleDeleteAccount() {
        if (!window.confirm('¿Estás seguro? Se cerrará tu sesión y se solicitará la eliminación de tu cuenta. Esta acción no se puede deshacer.')) return;
        if (!window.confirm('Última oportunidad. ¿Deseas continuar?')) return;
        try {
            // Eliminar datos del usuario (time_entries y pauses se eliminan en cascada via RLS)
            await supabase.from('time_entries').delete().eq('user_id', user!.id);
            await supabase.from('profiles').delete().eq('id', user!.id);
            await signOut();
        } catch {
            alert('Error al eliminar la cuenta. Contacta al administrador.');
        }
    }

    return (
        <div className="profile-page">
            <div className="page-header"><h1 className="page-title"><User size={24} />Mi Perfil</h1></div>
            <div className="profile-section">
                <div className="profile-avatar-section">
                    <div className="user-avatar user-avatar--xl">{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    <div><h2 className="profile-name">{profile?.full_name || 'Usuario'}</h2><p className="profile-email">{user?.email}</p></div>
                </div>
            </div>
            <div className="profile-section">
                <h3 className="section-title"><User size={18} />Información Personal</h3>
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    {profileErr && <div className="form-error">{profileErr}</div>}
                    {profileMsg && <div className="form-success">{profileMsg}</div>}
                    <div className="form-group"><label htmlFor="pn" className="form-label">Nombre Completo</label><input id="pn" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="form-input form-input--dark" required /></div>
                    <div className="form-group">
                        <label htmlFor="ms" className="form-label">Estado Civil</label>
                        <select
                            id="ms"
                            value={maritalStatus}
                            onChange={(e) => setMaritalStatus(e.target.value)}
                            className="form-input form-input--dark"
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="Soltero">Soltero/a</option>
                            <option value="Casado">Casado/a</option>
                            <option value="Viudo">Viudo/a</option>
                            <option value="Separado">Separado/a</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="ph" className="form-label">Teléfono</label>
                        <input
                            id="ph"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input form-input--dark"
                            placeholder="+56 9 XXXX XXXX"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bd" className="form-label">Fecha de Nacimiento</label>
                        <input
                            id="bd"
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="form-input form-input--dark"
                        />
                    </div>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" value={user?.email || ''} className="form-input form-input--dark" disabled /></div>
                    <button type="submit" disabled={profileLoading} className="btn btn-primary"><Save size={16} />{profileLoading ? 'Guardando...' : 'Guardar Cambios'}</button>
                </form>
            </div>
            <div className="profile-section">
                <h3 className="section-title"><Lock size={18} />Cambiar Contraseña</h3>
                <form onSubmit={handleChangePassword} className="profile-form">
                    {passwordErr && <div className="form-error">{passwordErr}</div>}
                    {passwordMsg && <div className="form-success">{passwordMsg}</div>}
                    <div className="form-group"><label htmlFor="np" className="form-label">Nueva Contraseña</label><input id="np" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input form-input--dark" placeholder="Mínimo 8 caracteres" required minLength={8} /></div>
                    <div className="form-group"><label htmlFor="cp" className="form-label">Confirmar</label><input id="cp" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input form-input--dark" placeholder="Repite la nueva contraseña" required minLength={8} /></div>
                    <button type="submit" disabled={passwordLoading} className="btn btn-primary"><Lock size={16} />{passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}</button>
                </form>
            </div>
            <div className="profile-section profile-section--danger">
                <h3 className="section-title section-title--danger"><Trash2 size={18} />Zona de Peligro</h3>
                <p className="danger-text">Eliminar tu cuenta es irreversible. Se perderán todos tus datos.</p>
                <button onClick={handleDeleteAccount} className="btn btn-danger"><Trash2 size={16} />Eliminar Cuenta</button>
            </div>
        </div>
    );
}
