import { useState, useEffect } from 'react';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { formatDuration } from '@/lib/utils';
import { calculateLiveWorkedSeconds, calculateLivePauseSeconds } from '@/lib/calculations';
import { Clock, Coffee, Briefcase } from 'lucide-react';

export function CurrentStatus() {
    const { workStatus, currentEntry } = useTimeTracking();
    const [workedSec, setWorkedSec] = useState(0);
    const [pausedSec, setPausedSec] = useState(0);

    useEffect(() => {
        if (!currentEntry || workStatus === 'idle') { setWorkedSec(0); setPausedSec(0); return; }
        function tick() {
            const now = new Date();
            setWorkedSec(calculateLiveWorkedSeconds(currentEntry!, now));
            setPausedSec(calculateLivePauseSeconds(currentEntry!, now));
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [currentEntry, workStatus]);

    const cfg = {
        idle: { label: 'Fuera de Jornada', icon: <Clock size={24} />, cls: 'status--idle' },
        working: { label: 'Trabajando', icon: <Briefcase size={24} />, cls: 'status--working' },
        paused: { label: 'En Pausa', icon: <Coffee size={24} />, cls: 'status--paused' },
    }[workStatus];

    return (
        <div className={`current-status ${cfg.cls}`}>
            <div className="status-indicator">
                <div className="status-dot" /><div className="status-icon">{cfg.icon}</div><span className="status-label">{cfg.label}</span>
            </div>
            {workStatus !== 'idle' && (
                <div className="status-timers">
                    <div className="timer-display"><span className="timer-value">{formatDuration(workedSec)}</span><span className="timer-label">Trabajado</span></div>
                    {pausedSec > 0 && <div className="timer-display timer-display--pause"><span className="timer-value">{formatDuration(pausedSec)}</span><span className="timer-label">En pausa</span></div>}
                </div>
            )}
        </div>
    );
}
