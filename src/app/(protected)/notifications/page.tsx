'use client';

import { useNotifications } from '@/lib/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Check, Trash2, Calendar, CreditCard, Scale, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
    const { notifications, isLoading, markAsRead, markAllAsRead, clearAll } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'ZAKAT_DUE': return <Scale className="h-5 w-5 text-amber-500" />;
            case 'MONTHLY_SUMMARY': return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'LARGE_TRANSACTION': return <CreditCard className="h-5 w-5 text-red-500" />;
            case 'BUDGET_WARNING': return <Sparkles className="h-5 w-5 text-orange-500" />;
            default: return <Bell className="h-5 w-5 text-slate-400" />;
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">A timeline of your financial alerts & high-priority events</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 font-bold px-4">
                        <Check className="h-4 w-4" />
                        Mark All Read
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-4">
                        <Trash2 className="h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardContent className="p-0">
                    {notifications.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6">
                                <Bell className="h-12 w-12 text-slate-200" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 leading-tight">Your notification center is empty!</p>
                            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-black">We'll alert you here when important things happen.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-6 flex gap-6 transition-all",
                                        !notification.isRead && "bg-blue-50/20 border-l-4 border-primary"
                                    )}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-lg shadow-slate-200/50">
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-base font-bold text-slate-900 leading-tight">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-1 hover:bg-white rounded-lg text-primary transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {notification.link && (
                                            <Link
                                                href={notification.link}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all group"
                                            >
                                                Take Action
                                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-dotted border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Want to customize these alerts?</p>
                        <p className="text-[10px] font-black uppercase text-slate-400">Manage your notification channels & limits in settings</p>
                    </div>
                </div>
                <Link href="/settings/notifications">
                    <Button variant="outline" className="h-11 px-8 rounded-xl font-bold border-2 hover:border-primary hover:bg-white transition-all">
                        Configure Alerts
                    </Button>
                </Link>
            </div>
        </div>
    );
}
