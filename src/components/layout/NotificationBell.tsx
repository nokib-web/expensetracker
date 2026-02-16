'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, Calendar, CreditCard, Scale, Sparkles, Settings } from 'lucide-react';
import { useNotifications } from '@/lib/NotificationContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'ZAKAT_DUE': return <Scale className="h-4 w-4 text-amber-500" />;
            case 'MONTHLY_SUMMARY': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'LARGE_TRANSACTION': return <CreditCard className="h-4 w-4 text-red-500" />;
            case 'BUDGET_WARNING': return <Sparkles className="h-4 w-4 text-orange-500" />;
            default: return <Bell className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Notifications</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={markAllAsRead}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-all group"
                                title="Mark all as read"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                onClick={clearAll}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                title="Clear all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="inline-flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                                    <Bell className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Clean Slate!</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">No notifications yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={cn(
                                            "p-4 flex gap-4 transition-colors cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                            !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/10 border-l-2 border-primary"
                                        )}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-2">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                            See All Notifications
                        </Link>
                        <Link
                            href="/settings/notifications"
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                        >
                            <Settings className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
