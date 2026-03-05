import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Database, Cpu, Wifi, Activity, RefreshCw, Shield, Lock, Search, History, ArrowRight, ArrowLeft } from 'lucide-react';

interface Service {
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    uptime: string;
    latency?: string;
    adminOnly?: boolean;
}

const SERVICES: Service[] = [
    { name: 'API Gateway', status: 'operational', uptime: '99.98%', latency: '42ms' },
    { name: 'Database (Supabase)', status: 'operational', uptime: '99.95%', latency: '18ms' },
    { name: 'AI Service (Yukime)', status: 'operational', uptime: '99.87%', latency: '380ms' },
    { name: 'Sync Worker', status: 'operational', uptime: '99.91%', latency: '60ms' },
    { name: 'Auth Service', status: 'operational', uptime: '100%', latency: '22ms' },
    { name: 'Storage Layer', status: 'operational', uptime: '99.99%', latency: '30ms', adminOnly: true },
    { name: 'Background Jobs', status: 'operational', uptime: '99.60%', latency: '—', adminOnly: true },
];



const STATUS_ICONS = {
    operational: <CheckCircle2 size={16} className="text-emerald-500" />,
    degraded: <AlertTriangle size={16} className="text-amber-500" />,
    outage: <XCircle size={16} className="text-rose-500" />,
};

const STATUS_LABELS = { operational: 'Operational', degraded: 'Degraded', outage: 'Outage' };
const STATUS_COLORS = {
    operational: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    degraded: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    outage: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export const SupportSystemStatus: React.FC = () => {
    const { isDarkMode, isAdmin, systemHealth, fetchSystemHealth, incidents, fetchIncidents, aiActionLogs, userProfile, addNotification } = useAppStore();
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [selectedDay, setSelectedDay] = React.useState<{ date: string; incidents: any[] } | null>(null);
    const dk = isDarkMode;

    React.useEffect(() => {
        fetchSystemHealth();
        fetchIncidents();
        const interval = setInterval(() => {
            fetchSystemHealth();
            fetchIncidents();
        }, 30000); // Pulse check every 30s
        return () => clearInterval(interval);
    }, []);

    const dynamicServices = SERVICES.map(s => {
        if (s.name === 'Database (Supabase)') return { ...s, status: systemHealth.dbStatus };
        if (s.name === 'AI Service (Yukime)') return { ...s, latency: `${systemHealth.aiLatency}ms` };
        return s;
    });

    const visibleServices = dynamicServices.filter(s => !s.adminOnly || isAdmin);
    const overallStatus: 'operational' | 'degraded' | 'outage' = visibleServices.some(s => s.status === 'outage') ? 'outage'
        : visibleServices.some(s => s.status === 'degraded') ? 'degraded' : 'operational';

    const securityAlerts = aiActionLogs.filter(log =>
        log.action_type?.includes('delete') ||
        log.action_type?.includes('role') ||
        log.details?.priority === 'critical'
    ).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Overall Health Banner */}
            <div className={`p-6 rounded-2xl border ${overallStatus === 'operational'
                ? dk ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
                : dk ? 'bg-amber-900/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${overallStatus === 'operational' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        {overallStatus === 'operational' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertTriangle size={24} className="text-amber-500" />}
                    </div>
                    <div>
                        <h3 className={`font-black text-lg ${dk ? 'text-white' : 'text-gray-900'}`}>
                            {overallStatus === 'operational' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Partial Service Disruption' : 'Service Outage'}
                        </h3>
                        <p className="text-sm text-gray-500">Last updated: {new Date(systemHealth.lastCheck).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                        onClick={async () => {
                            setIsRefreshing(true);
                            try {
                                await Promise.all([fetchSystemHealth(), fetchIncidents()]);
                                addNotification({ type: 'success', message: 'System status updated successfully' });
                            } catch (error) {
                                addNotification({ type: 'error', message: 'Failed to refresh system status' });
                            } finally {
                                setIsRefreshing(false);
                            }
                        }}
                        className={`ml-auto p-2 rounded-lg transition-colors ${dk ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-500 border border-gray-200'}`}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* If contributor, just show the banner + simple message */}
            {!isAdmin && (
                <div className={`p-5 rounded-2xl border ${dk ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm ${dk ? 'text-gray-400' : 'text-gray-600'}`}>
                        Detailed infrastructure metrics are available to administrators. If you are experiencing issues, please <strong className={dk ? 'text-white' : 'text-gray-900'}>submit a support ticket</strong>.
                    </p>
                </div>
            )}

            {/* Service Grid (Admin/Manager) */}
            {isAdmin && (
                <>
                    <div>
                        <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>Service Health</h4>
                        <div className="space-y-2">
                            {visibleServices.map(service => (
                                <div key={service.name} className={`flex items-center gap-4 p-4 rounded-xl border ${dk ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'}`}>
                                    <div className="shrink-0">{STATUS_ICONS[service.status]}</div>
                                    <p className={`flex-1 text-sm font-medium ${dk ? 'text-gray-200' : 'text-gray-800'}`}>{service.name}</p>
                                    <div className="flex items-center gap-3">
                                        {service.latency && (
                                            <span className="text-[11px] text-gray-500 hidden sm:block">
                                                <span className="font-bold text-gray-400">{service.latency}</span> avg
                                            </span>
                                        )}
                                        <span className="text-[11px] text-gray-500 hidden sm:block">
                                            <span className="font-bold text-emerald-400">{service.uptime}</span> uptime
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_COLORS[service.status]}`}>
                                            {STATUS_LABELS[service.status]}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Uptime Overview */}
                    <div className={`p-6 rounded-2xl border ${dk ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'}`}>
                        <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>90-Day Uptime Overview</h4>
                        <div className="overflow-x-auto custom-scrollbar -mx-1 px-1 pb-2">
                            <div className="flex gap-1 h-12 items-end min-w-[600px]">
                                {Array.from({ length: 90 }, (_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (89 - i));
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayIncidents = incidents.filter(inc => inc.created_at.startsWith(dateStr));
                                    const hasOutage = dayIncidents.some(inc => inc.severity === 'critical');
                                    const hasDegraded = dayIncidents.some(inc => inc.severity === 'major' || inc.severity === 'minor');

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDay({ date: dateStr, incidents: dayIncidents })}
                                            className={`flex-1 h-8 rounded-sm transition-all hover:h-10 hover:opacity-100 ${hasOutage ? 'bg-rose-500/60' :
                                                hasDegraded ? 'bg-amber-500/60' :
                                                    'bg-emerald-500/60'
                                                } ${selectedDay?.date === dateStr ? 'ring-2 ring-indigo-500 h-10 opacity-100' : 'opacity-80'}`}
                                            title={`${dateStr}: ${dayIncidents.length} incidents`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-500">90 days ago</span>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400"><div className="w-2 h-2 rounded-sm bg-emerald-500/60" /> Operational</span>
                                <span className="flex items-center gap-1 text-[10px] text-amber-400"><div className="w-2 h-2 rounded-sm bg-amber-500/60" /> Degraded</span>
                                <span className="flex items-center gap-1 text-[10px] text-rose-400"><div className="w-2 h-2 rounded-sm bg-rose-500/60" /> Outage</span>
                            </div>
                            <span className="text-[10px] text-gray-500">Today</span>
                        </div>

                        {/* Selected Day Details */}
                        <AnimatePresence>
                            {selectedDay && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`mt-6 p-4 rounded-xl border ${dk ? 'bg-indigo-900/10 border-indigo-500/30 backdrop-blur-md' : 'bg-indigo-50 border-indigo-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className={`text-xs font-black uppercase tracking-widest ${dk ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            Diagnostics: {new Date(selectedDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </h5>
                                        <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-gray-400"><XCircle size={14} /></button>
                                    </div>

                                    {selectedDay.incidents.length === 0 ? (
                                        <p className="text-xs text-emerald-500 font-medium flex items-center gap-2">
                                            <CheckCircle2 size={12} /> No incidents reported. Systems were 100% operational.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedDay.incidents.map((inc, idx) => {
                                                const start = new Date(inc.created_at);
                                                const end = inc.resolved_at ? new Date(inc.resolved_at) : null;
                                                const durationMinutes = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

                                                return (
                                                    <div key={idx} className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${inc.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                            <p className={`text-sm font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{inc.title}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 ml-3.5 mt-0.5">
                                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                <Clock size={10} /> {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {durationMinutes !== null && (
                                                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded leading-none">
                                                                    Resolved in {durationMinutes}m
                                                                </span>
                                                            )}
                                                            {!inc.resolved_at && (
                                                                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded leading-none animate-pulse">
                                                                    Ongoing incident
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Incidents */}
                    <div>
                        <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dk ? 'text-gray-500' : 'text-gray-400'}`}>Recent Incidents</h4>
                        <div className="space-y-3">
                            {incidents.length === 0 ? (
                                <div className={`p-8 text-center rounded-xl border border-dashed ${dk ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                                    <p className="text-sm">No recent incidents reported.</p>
                                </div>
                            ) : (
                                incidents.map((inc, i) => (
                                    <div key={inc.id || i} className={`p-4 rounded-xl border ${dk ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-opacity-10 ${inc.severity === 'minor' ? 'bg-amber-500 text-amber-400' : inc.severity === 'major' ? 'bg-orange-500 text-orange-400' : 'bg-rose-500 text-rose-400'}`}>
                                                        {inc.severity}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">{new Date(inc.created_at).toLocaleDateString()}</span>
                                                    {inc.status === 'resolved' && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400">Resolved</span>}
                                                    {inc.status === 'investigating' && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400">Investigating</span>}
                                                </div>
                                                <p className={`text-sm font-bold ${dk ? 'text-white' : 'text-gray-900'}`}>{inc.title}</p>
                                                <p className={`text-xs mt-1 ${dk ? 'text-gray-400' : 'text-gray-600'}`}>{inc.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Security Intelligence (Global Admin Only) */}
                    {userProfile?.global_role === 'Global Admin' && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Shield size={14} className="text-indigo-500" />
                                <h4 className={`text-xs font-bold uppercase tracking-widest ${dk ? 'text-gray-500' : 'text-gray-400'}`}>Security Intelligence</h4>
                            </div>
                            <div className={`p-6 rounded-2xl border ${dk ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'} space-y-4`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border ${dk ? 'bg-gray-800/20 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Critical Events (24h)</p>
                                        <p className={`text-xl font-black ${securityAlerts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{securityAlerts.length}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${dk ? 'bg-gray-800/20 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mb-1">Auth Health Score</p>
                                        <p className="text-xl font-black text-indigo-400">98/100</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Audit Stream</p>
                                    {securityAlerts.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic py-2">No critical security events detected in the last stream.</p>
                                    ) : (
                                        securityAlerts.map((log, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${dk ? 'bg-gray-800/10 border-gray-800/30' : 'bg-gray-50/50 border-gray-100'}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.action_type?.includes('delete') ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    <Lock size={14} />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className={`text-xs font-bold truncate ${dk ? 'text-gray-200' : 'text-gray-900'}`}>{log.action_type?.replace('_', ' ')}</p>
                                                    <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                                <button className={`p-1.5 rounded-lg transition-colors ${dk ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`}>
                                                    <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
