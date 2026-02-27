import { useState } from 'react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Play, Square, AlertCircle } from 'lucide-react';

export function TimeClockControls() {
    const { workStatus, clockIn, clockOut } = useTimeTracking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleClockIn() {
        setError(''); setLoading(true);
        try { await clockIn(); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    async function handleClockOut() {
        if (!window.confirm('¿Deseas finalizar tu jornada?')) return;
        setError(''); setLoading(true);
        try { await clockOut(); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    return (
        <div className="clock-controls">
            {error && <div className="clock-error"><AlertCircle size={16} /><span>{error}</span></div>}
            {workStatus === 'idle' ? (
                <button onClick={handleClockIn} disabled={loading} className="btn-clock btn-clock--in" aria-label="Iniciar jornada">
                    <Play size={32} /><span>{loading ? 'Iniciando...' : 'Entrar'}</span>
                </button>
            ) : (
                <button onClick={handleClockOut} disabled={loading} className="btn-clock btn-clock--out" aria-label="Finalizar jornada">
                    <Square size={32} /><span>{loading ? 'Finalizando...' : 'Salir'}</span>
                </button>
            )}
        </div>
    );
}
