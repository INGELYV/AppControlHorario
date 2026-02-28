import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatTime, formatDate, formatHoursDecimal } from '@/lib/utils';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import type { TimeEntry } from '@/types';
import { Clock, Trash2, ChevronDown, ChevronUp, Calendar, Edit3 } from 'lucide-react';

type FilterPeriod = 'week' | 'month' | 'all';

export default function HistoryPage() {
    const [filter, setFilter] = useState<FilterPeriod>('week');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const daysAgo = filter === 'week' ? 7 : filter === 'month' ? 30 : 365;
    const { entries, loading, setEntries } = useTimeEntries({ daysAgo });

    async function handleDelete(id: string) {
        if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;

        const { error } = await supabase.from('time_entries').delete().eq('id', id);
        if (error) { alert('Error al eliminar'); return; }
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    const grouped = entries.reduce<Record<string, TimeEntry[]>>((g, e) => { (g[e.date] = g[e.date] || []).push(e); return g; }, {});
    const PAUSE_LABELS: Record<string, string> = { meal: 'Comida', break: 'Descanso', other: 'Otra' };

    return (
        <div className="history-page">
            <div className="page-header">
                <h1 className="page-title"><Clock size={24} />Historial</h1>
                <div className="filter-tabs">
                    {(['week', 'month', 'all'] as FilterPeriod[]).map((p) => (
                        <button key={p} onClick={() => setFilter(p)} className={`filter-tab ${filter === p ? 'filter-tab--active' : ''}`}>
                            {p === 'week' ? '7 días' : p === 'month' ? '30 días' : 'Todo'}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? <div className="loading-state"><div className="spinner" /><p>Cargando historial...</p></div>
                : entries.length === 0 ? <div className="empty-state"><Calendar size={48} /><h3>Sin registros</h3><p>No hay registros para este período.</p></div>
                    : <div className="entries-list">
                        {Object.entries(grouped).map(([date, dayE]) => (
                            <div key={date} className="entry-group"><h3 className="entry-group-date">{formatDate(date)}</h3>
                                {dayE.map((entry) => (
                                    <div key={entry.id} className="entry-card">
                                        <div className="entry-card-header" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                                            <div className="entry-times"><span className="entry-time entry-time--in">{formatTime(entry.clock_in)}</span><span className="entry-separator">→</span><span className="entry-time entry-time--out">{entry.clock_out ? formatTime(entry.clock_out) : 'En curso'}</span></div>
                                            <div className="entry-meta">
                                                <span className={`entry-status entry-status--${entry.status}`}>{entry.status === 'completed' ? 'Completada' : entry.status === 'active' ? 'Activa' : 'Pausada'}</span>
                                                {entry.total_hours !== null && <span className="entry-hours">{formatHoursDecimal(entry.total_hours)}h</span>}
                                                {entry.edited_manually && <span className="entry-edited" title="Editado"><Edit3 size={12} /></span>}
                                                {expandedId === entry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                        {expandedId === entry.id && (
                                            <div className="entry-card-body">
                                                {entry.pauses && entry.pauses.length > 0 && <div className="entry-pauses"><h4>Pausas:</h4>
                                                    {entry.pauses.map((p) => <div key={p.id} className="pause-item"><span className="pause-type">{PAUSE_LABELS[p.type] || p.type}</span><span className="pause-time">{formatTime(p.start_time)}{p.end_time ? ` → ${formatTime(p.end_time)}` : ' (en curso)'}</span>{p.duration !== null && <span className="pause-duration">{p.duration} min</span>}</div>)}
                                                </div>}
                                                {entry.notes && <div className="entry-notes"><h4>Notas:</h4><p>{entry.notes}</p></div>}
                                                {entry.status === 'completed' && <div className="entry-actions"><button onClick={() => handleDelete(entry.id)} className="btn btn-danger btn-sm"><Trash2 size={14} />Eliminar</button></div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
            }
        </div>
    );
}
