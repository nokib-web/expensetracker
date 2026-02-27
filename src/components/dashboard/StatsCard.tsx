import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconColor: string;
    change?: number;
    isLoading?: boolean;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    iconColor,
    change,
    isLoading,
}: StatsCardProps) {
    if (isLoading) {
        return (
            <Card className="relative overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        <div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-8 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    return (
        <Card className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20", iconColor)} />

            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("p-2.5 rounded-xl shadow-lg ring-4 ring-white transition-transform group-hover:scale-110 duration-500", iconColor)}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>

                    {change !== undefined && (
                        <div className={cn(
                            "flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black tracking-tight",
                            isPositive ? "bg-emerald-50 text-emerald-600" : isNegative ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                        )}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : isNegative ? <ArrowDownRight className="h-3 w-3" /> : null}
                            {Math.abs(change).toFixed(1)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">
                        {title}
                    </p>
                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(value)}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Total this period</span>
                    <div className="flex -space-x-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-5 w-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800" />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
