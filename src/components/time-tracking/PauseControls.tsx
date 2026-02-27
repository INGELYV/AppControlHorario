import { useState } from 'react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Coffee, UtensilsCrossed, MoreHorizontal, Play } from 'lucide-react';
import type { PauseType } from '@/types';

const PAUSE_OPTIONS: { type: PauseType; label: string; icon: React.ReactNode }[] = [
    { type: 'meal', label: 'Comida', icon: <UtensilsCrossed size={18} /> },
    { type: 'break', label: 'Descanso', icon: <Coffee size={18} /> },
    { type: 'other', label: 'Otra', icon: <MoreHorizontal size={18} /> },
];

export function PauseControls() {
    const { workStatus, startPause, endPause } = useTimeTracking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (workStatus === 'idle') return null;

    async function handleStartPause(type: PauseType) {
        setError(''); setLoading(true);
        try { await startPause(type); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    async function handleEndPause() {
        setError(''); setLoading(true);
        try { await endPause(); } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
        finally { setLoading(false); }
    }

    return (
        <div className="pause-controls">
            {error && <p className="pause-error">{error}</p>}
            {workStatus === 'working' && (
                <div className="pause-options"><p className="pause-title">Tomar pausa:</p>
                    <div className="pause-buttons">{PAUSE_OPTIONS.map((o) => (
                        <button key={o.type} onClick={() => handleStartPause(o.type)} disabled={loading} className="btn-pause">{o.icon}<span>{o.label}</span></button>
                    ))}</div>
                </div>
            )}
            {workStatus === 'paused' && (
                <button onClick={handleEndPause} disabled={loading} className="btn btn-accent btn-full"><Play size={18} /><span>{loading ? 'Reanudando...' : 'Reanudar Trabajo'}</span></button>
            )}
        </div>
    );
}
