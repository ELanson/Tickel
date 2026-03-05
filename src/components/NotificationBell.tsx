import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const NotificationBell = () => {
    const {
        isDarkMode,
        notifications,
        setIsNotificationModalOpen,
        clearUnseenNotifications
    } = useAppStore();

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
    const hasUnseen = useMemo(() => notifications.some(n => !n.isSeen), [notifications]);

    const handleClick = () => {
        setIsNotificationModalOpen(true);
        clearUnseenNotifications();
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 rounded-xl transition-all hover:bg-gray-500/10 group focus:outline-none"
            title="Notifications"
        >
            {/* Glow Effect */}
            {hasUnseen && (
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md pointer-events-none"
                />
            )}

            {/* Shaking Bell */}
            <motion.div
                animate={hasUnseen ? {
                    rotate: [0, -10, 10, -10, 10, 0],
                } : {}}
                transition={{
                    duration: 0.5,
                    repeat: hasUnseen ? Infinity : 0,
                    repeatDelay: 2
                }}
                className={`${hasUnseen ? 'text-indigo-500' : (isDarkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700')} transition-colors`}
            >
                <Bell size={20} fill={hasUnseen ? 'currentColor' : 'none'} className={hasUnseen ? 'fill-indigo-500/20' : ''} />
            </motion.div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#121214] shadow-sm shadow-indigo-900/40"
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
            )}
        </button>
    );
};
