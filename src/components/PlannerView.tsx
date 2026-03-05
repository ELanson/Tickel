import React, { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    ListTodo,
    Sparkles,
    ExternalLink,
    MapPin,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, Task, Appointment } from '../store/useAppStore';

export function PlannerView() {
    const {
        isDarkMode,
        tasks,
        appointments,
        addAppointment,
        plannerView,
        setPlannerView,
        selectedPlannerDate,
        setSelectedPlannerDate,
        dayPlan,
        setDayPlan
    } = useAppStore();

    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Calendar Helpers
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const calendarDays = useMemo(() => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const firstDay = firstDayOfMonth(currentMonth);

        // Padding for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Days of current month
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                date: dateStr,
                hasTasks: tasks.some(t => t.due_date?.startsWith(dateStr)),
                hasAppointments: appointments.some(a => a.date === dateStr)
            });
        }
        return days;
    }, [currentMonth, tasks, appointments]);

    const selectedDateTasks = useMemo(() => {
        return tasks.filter(t => t.due_date?.startsWith(selectedPlannerDate));
    }, [tasks, selectedPlannerDate]);

    const selectedDateApps = useMemo(() => {
        return appointments.filter(a => a.date === selectedPlannerDate);
    }, [appointments, selectedPlannerDate]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Section */}
            <div className={`lg:col-span-8 ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-100'} rounded-[24px] border shadow-sm overflow-hidden`}>
                <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-50'} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                            <CalendarIcon className="text-indigo-500" size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium">Plan your focus journey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex rounded-lg p-0.5 border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            {(['month', 'week', 'day'] as const).map(v => (
                                <button
                                    key={v}
                                    onClick={() => setPlannerView(v)}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${plannerView === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1 ml-2">
                            <button onClick={handlePrevMonth} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-all`}>
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={handleNextMonth} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-all`}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-2">{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => (
                            <div key={idx} className="aspect-square relative">
                                {day && (
                                    <button
                                        onClick={() => setSelectedPlannerDate(day.date)}
                                        className={`w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${selectedPlannerDate === day.date
                                                ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20'
                                                : isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-indigo-50 text-gray-700'
                                            }`}
                                    >
                                        <span className={`text-sm font-bold ${selectedPlannerDate === day.date ? 'text-white' : ''}`}>
                                            {day.day}
                                        </span>
                                        <div className="flex gap-1">
                                            {day.hasTasks && (
                                                <div className={`w-1 h-1 rounded-full ${selectedPlannerDate === day.date ? 'bg-white/60' : 'bg-indigo-500'}`}></div>
                                            )}
                                            {day.hasAppointments && (
                                                <div className={`w-1 h-1 rounded-full ${selectedPlannerDate === day.date ? 'bg-white/60' : 'bg-rose-500'}`}></div>
                                            )}
                                        </div>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Planner Side Panel */}
            <div className="lg:col-span-4 space-y-6">
                {/* Day Header */}
                <div className={`${isDarkMode ? 'bg-[#121214] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'} rounded-[24px] border p-6 shadow-sm`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Schedule for</p>
                            <h4 className="text-xl font-bold">
                                {new Date(selectedPlannerDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h4>
                        </div>
                        <button className={`p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/10 transition-all`}>
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* AI Suggest Section */}
                    <div className={`p-4 rounded-2xl border border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'} mb-6`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                                <Sparkles className="text-white" size={14} />
                            </div>
                            <p className="text-xs font-bold tracking-tight">Need a plan for today?</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-3">Yukime can analyze your tasks and suggest an optimized schedule.</p>
                        <button className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-800 border transition-all hover:border-indigo-500 hover:text-indigo-500`}>
                            Suggest My Day
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Appointments */}
                        {selectedDateApps.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-1">Appointments</p>
                                {selectedDateApps.map(app => (
                                    <div key={app.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1a1c1d] border-gray-800' : 'bg-indigo-50/30 border-indigo-100'} group hover:border-indigo-500 transition-all`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-xs font-bold truncate">{app.title}</h5>
                                            <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">Event</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {app.location && <span className="flex items-center gap-1.5"><MapPin size={12} /> {app.location}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tasks */}
                        {selectedDateTasks.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-1">Planned Tasks</p>
                                {selectedDateTasks.map(task => (
                                    <div key={task.id} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1a1c1d] border-gray-800' : 'bg-gray-50 border-gray-100'} group hover:border-indigo-500 transition-all`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            {task.status === 'done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Circle size={14} className="text-gray-400" />}
                                            <h5 className="text-xs font-bold truncate">{task.title}</h5>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${task.priority === 'urgent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                    task.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                                                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{task.estimated_hours}h</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedDateTasks.length === 0 && selectedDateApps.length === 0 && (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                    <ListTodo size={20} className="text-gray-500" />
                                </div>
                                <p className="text-xs font-bold text-gray-500">Nothing planned for this day.</p>
                                <p className="text-[10px] text-gray-400 mt-1">Add a task or event to start.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sync Card */}
                <div className={`p-5 rounded-[24px] border ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-600 text-white'} shadow-lg shadow-indigo-900/10`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20' : 'bg-white/20'}`}>
                            <ExternalLink size={16} />
                        </div>
                        <p className="text-xs font-bold">Google Calendar Sync</p>
                    </div>
                    <p className={`text-[10px] mb-4 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-100'}`}>Keep your work life and personal events in perfect harmony.</p>
                    <button className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600'} shadow-sm transition-all hover:scale-[1.02]`}>
                        Connect Now
                    </button>
                </div>
            </div>
        </div>
    );
}
