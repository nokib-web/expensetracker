'use client';

import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MonthlyOverviewProps {
    summary: {
        totalIncome: number;
        totalExpense: number;
        netSavings: number;
        savingsRate: number;
        incomeChange: number;
        expenseChange: number;
    };
}

export function MonthlyOverview({ summary }: MonthlyOverviewProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const cards = [
        {
            title: 'Total Income',
            value: formatCurrency(summary.totalIncome),
            icon: Banknote,
            trend: summary.incomeChange,
            color: 'blue',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(summary.totalExpense),
            icon: Wallet,
            trend: summary.expenseChange,
            color: 'red',
            inverseTrend: true,
        },
        {
            title: 'Net Savings',
            value: formatCurrency(summary.netSavings),
            icon: PiggyBank,
            trend: null,
            color: 'emerald',
        },
        {
            title: 'Savings Rate',
            value: `${summary.savingsRate.toFixed(1)}%`,
            icon: TrendingUp,
            trend: null,
            color: 'purple',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
                <Card key={card.title} className="border-none shadow-xl shadow-slate-200/50 bg-white dark:bg-slate-900 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{card.title}</CardTitle>
                        <div className={cn(
                            "p-2 rounded-lg transition-colors group-hover:bg-opacity-20",
                            card.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                card.color === 'red' ? "bg-red-50 text-red-600" :
                                    card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                        "bg-purple-50 text-purple-600"
                        )}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</div>
                        {card.trend !== null && (
                            <div className={cn(
                                "flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-tight",
                                (card.trend >= 0 && !card.inverseTrend) || (card.trend <= 0 && card.inverseTrend)
                                    ? "text-emerald-600"
                                    : "text-red-600"
                            )}>
                                {card.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                <span>{Math.abs(card.trend).toFixed(1)}%</span>
                                <span className="text-muted-foreground ml-1 font-medium">vs last month</span>
                            </div>
                        )}
                        {card.trend === null && (
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        card.color === 'emerald' ? "bg-emerald-500" : "bg-purple-500"
                                    )}
                                    style={{ width: card.title === 'Savings Rate' ? `${Math.max(0, Math.min(100, summary.savingsRate))}%` : '100%' }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
