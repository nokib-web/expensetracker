'use client';

import { AlertCircle, CheckCircle2, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialInsightsProps {
    summary: any;
    categoryStats: any;
    biggestTransactions: any;
}

export function FinancialInsights({ summary, categoryStats, biggestTransactions }: FinancialInsightsProps) {
    const insights = [];

    // Spending Insight
    const topExpense = categoryStats.expense[0];
    if (topExpense) {
        const percent = (topExpense.amount / summary.totalExpense) * 100;
        insights.push({
            icon: AlertCircle,
            title: 'Major Spending',
            desc: `You spent ${percent.toFixed(1)}% of your budget on ${topExpense.categoryName}. Considers reviewing this category for potential savings.`,
            color: 'red'
        });
    }

    // Savings Insight
    if (summary.savingsRate > 20) {
        insights.push({
            icon: CheckCircle2,
            title: 'Healthy Savings',
            desc: `Great job! Your savings rate of ${summary.savingsRate.toFixed(1)}% is above the recommended 20% benchmark.`,
            color: 'emerald'
        });
    } else if (summary.savingsRate < 0) {
        insights.push({
            icon: TrendingDown,
            title: 'Overspending Alert',
            desc: `Your expenses exceeded your income this month. Review your biggest transactions to find the cause.`,
            color: 'red'
        });
    }

    // Growth Insight
    if (summary.expenseChange < 0) {
        insights.push({
            icon: TrendingUp,
            title: 'Expense Reduction',
            desc: `Your spending is down ${Math.abs(summary.expenseChange).toFixed(1)}% compared to last month. Keep it up!`,
            color: 'blue'
        });
    }

    // Biggest Transaction
    if (biggestTransactions.expense) {
        insights.push({
            icon: Lightbulb,
            title: 'Largest Expense',
            desc: `Your biggest purchase was ${biggestTransactions.expense.description || 'a transaction'} for $${Number(biggestTransactions.expense.amount).toFixed(2)} on ${new Date(biggestTransactions.expense.transactionDate).toLocaleDateString()}.`,
            color: 'purple'
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.map((insight, i) => (
                <Card key={i} className="border-none shadow-lg shadow-slate-100/50 bg-white dark:bg-slate-900 border-l-4 border-l-primary overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-3 pb-2 space-y-0">
                        <div className={`p-2 rounded-full ${insight.color === 'red' ? "bg-red-50 text-red-500" :
                                insight.color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
                                    insight.color === 'blue' ? "bg-blue-50 text-blue-500" :
                                        "bg-purple-50 text-purple-500"
                            }`}>
                            <insight.icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold">{insight.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
