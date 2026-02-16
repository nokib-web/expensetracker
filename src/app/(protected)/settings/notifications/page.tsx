'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Bell, Scale, Calendar, CreditCard, Sparkles, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function NotificationSettingsPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>(null);

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['notification-preferences'],
        queryFn: () => fetch('/api/notifications/preferences').then(res => res.json())
    });

    useEffect(() => {
        if (preferences) {
            setFormData(preferences);
        }
    }, [preferences]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => fetch('/api/notifications/preferences', {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            toast.success('Preferences updated');
        },
        onError: () => {
            toast.error('Failed to update preferences');
        }
    });

    if (isLoading || !formData) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;

    const toggle = (key: string) => {
        setFormData({ ...formData, [key]: !formData[key] });
    };

    const items = [
        { key: 'zakatDueAlert', label: 'Zakat Due Alerts', desc: 'Notify when Zakat eligibility threshold is reached.', icon: <Scale className="h-5 w-5 text-amber-500" /> },
        { key: 'monthlySummaryAlert', label: 'Monthly Summaries', desc: 'Get a notification when your monthly financial report is ready.', icon: <Calendar className="h-5 w-5 text-blue-500" /> },
        { key: 'largeTransactionAlert', label: 'Large Transactions', desc: 'Warn when a single transaction exceeds your limit.', icon: <CreditCard className="h-5 w-5 text-red-500" /> },
        { key: 'budgetWarningAlert', label: 'Budget Warnings', desc: 'Alert when spending approaches or exceeds income.', icon: <Sparkles className="h-5 w-5 text-orange-500" /> },
        { key: 'paymentReminderAlert', label: 'Payment Reminders', desc: 'Remind when Zakat payment dates are approaching.', icon: <Bell className="h-5 w-5 text-slate-500" /> },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Notification Settings</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Customize how and when you want to be alerted</p>
                </div>
                <Button
                    variant="primary"
                    className="gap-2 h-11 px-8 shadow-lg shadow-primary/20"
                    onClick={() => updateMutation.mutate(formData)}
                    disabled={updateMutation.isPending}
                >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Alert Preferences</CardTitle>
                            <CardDescription>Choose which events trigger a notification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                            <p className="text-[10px] uppercase font-black tracking-tighter text-slate-400">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggle(item.key)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                            formData[item.key] ? "bg-primary" : "bg-slate-200"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                formData[item.key] ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-red-400" />
                                Limits & Thresholds
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Large Transaction Limit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.largeTransactionLimit}
                                        onChange={(e) => setFormData({ ...formData, largeTransactionLimit: e.target.value })}
                                        className="w-full h-12 pl-8 pr-4 bg-slate-800 border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none"
                                    />
                                </div>
                                <p className="text-[9px] text-slate-500 italic">Transactions exceeding this amount will trigger an alert.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
