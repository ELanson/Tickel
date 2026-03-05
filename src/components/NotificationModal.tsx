import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X,
    Bell,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Trash2,
    Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore, AppNotification } from '../store/useAppStore';

const ICON_MAP: Record<AppNotification['type'], React.ReactNode> = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-indigo-500" />
};

export const NotificationModal = () => {
    const {
        isDarkMode,
        notifications,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification
    } = useAppStore();

    if (!isNotificationModalOpen) return null;

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNotificationModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-2xl max-h-[80vh] flex flex-col ${isDarkMode ? 'bg-[#121214] border-gray-800' : 'bg-white border-gray-200'} border rounded-[32px] shadow-2xl overflow-hidden`}
                >
                    {/* Header */}
                    <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                <Bell className="text-indigo-500" size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
                                <p className="text-xs text-gray-500 font-medium">System updates and team alerts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadNotifications.length > 0 && (
                                <button
                                    onClick={markAllNotificationsAsRead}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsNotificationModalOpen(false)}
                                className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                    <Bell size={32} className="text-gray-700" />
                                </div>
                                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All caught up!</h3>
                                <p className="text-sm text-gray-500 max-w-xs mt-1">No new notifications to show right now. We'll alert you when something happens.</p>
                            </div>
                        ) : (
                            <>
                                {unreadNotifications.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 px-2">New</h3>
                                        <div className="grid gap-3">
                                            {unreadNotifications.map(n => (
                                                <NotificationItem
                                                    key={n.id}
                                                    notification={n}
                                                    isDarkMode={isDarkMode}
                                                    onRead={() => markNotificationAsRead(n.id)}
                                                    onRemove={() => removeNotification(n.id)}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {readNotifications.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2">Previously Read</h3>
                                        <div className="grid gap-3">
                                            {readNotifications.map(n => (
                                                <NotificationItem
                                                    key={n.id}
                                                    notification={n}
                                                    isDarkMode={isDarkMode}
                                                    onRemove={() => removeNotification(n.id)}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const NotificationItem = ({
    notification,
    isDarkMode,
    onRead,
    onRemove
}: {
    notification: AppNotification;
    isDarkMode: boolean;
    onRead?: () => void;
    onRemove: () => void;
}) => {
    return (
        <motion.div
            layout
            onClick={onRead}
            className={`group p-5 rounded-2xl border transition-all ${!notification.isRead
                ? (isDarkMode ? 'bg-[#1a1c1d] border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-100')
                : (isDarkMode ? 'bg-zinc-900/40 border-gray-800' : 'bg-gray-50 border-gray-100')
                } hover:scale-[1.01] cursor-pointer relative overflow-hidden`}
        >
            {!notification.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
            )}

            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-black/20' : 'bg-white shadow-sm border border-gray-100'}`}>
                    {ICON_MAP[notification.type]}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap ml-4">
                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {notification.body && (
                        <div className={`text-xs leading-relaxed prose prose-sm max-w-none ${isDarkMode ? 'prose-invert text-gray-400' : 'text-gray-600'}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {notification.body}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className={`p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                        <Trash2 size={16} />
                    </button>
                    {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 m-auto" />
                    )}
                </div>
            </div>
        </motion.div>
    );
};
