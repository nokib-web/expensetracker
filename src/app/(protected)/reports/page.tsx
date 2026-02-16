'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { MonthlyOverview } from '@/components/reports/MonthlyOverview';
import { FinancialCharts } from '@/components/reports/FinancialCharts';
import { FinancialInsights } from '@/components/reports/FinancialInsights';
import { TransactionBreakdown } from '@/components/reports/TransactionBreakdown';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { exportToCSV, formatTransactionsForExport } from '@/lib/export';
import { format } from 'date-fns';

export default function ReportsPage() {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    // Fetch Monthly Data
    const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
        queryKey: ['reports-monthly', month, year],
        queryFn: () => fetch(`/api/reports/monthly?month=${month}&year=${year}`).then(res => res.json())
    });

    // Fetch Yearly Data
    const { data: yearlyData, isLoading: isYearlyLoading } = useQuery({
        queryKey: ['reports-yearly', year],
        queryFn: () => fetch(`/api/reports/yearly?year=${year}`).then(res => res.json())
    });

    const handleDateChange = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);
    };

    const handleExportCSV = () => {
        if (monthlyData?.transactions) {
            const formatted = formatTransactionsForExport(monthlyData.transactions);
            const filename = `Financial_Report_${format(new Date(year, month, 1), 'MMMM_yyyy')}`;
            exportToCSV(formatted, filename);
        }
    };

    if (isMonthlyLoading || isYearlyLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LoadingSpinner size="lg" className="text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium tracking-tight text-sm uppercase">Calculating your financial performance...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-12 animate-in fade-in duration-700">
            {/* Header with selector */}
            <ReportHeader
                month={month}
                year={year}
                onDateChange={handleDateChange}
                onExportCSV={handleExportCSV}
            />

            {/* Monthly Summary Cards */}
            <section className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 ml-1">Monthly Overview</h2>
                <MonthlyOverview summary={monthlyData.summary} />
            </section>

            {/* Charts Section */}
            <section className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 ml-1">Visualization</h2>
                <FinancialCharts
                    dailyTotals={monthlyData.dailyTotals}
                    categoryStats={monthlyData.categoryStats}
                    yearlyData={yearlyData?.monthlyData}
                />
            </section>

            {/* Insights Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-1 bg-primary w-8 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Automated Insights</h2>
                </div>
                <FinancialInsights
                    summary={monthlyData.summary}
                    categoryStats={monthlyData.categoryStats}
                    biggestTransactions={monthlyData.biggestTransactions}
                />
            </section>

            {/* Transaction Breakdown Table */}
            <section className="space-y-4 pb-12">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 ml-1">Detailed Breakdown</h2>
                <TransactionBreakdown transactions={monthlyData.transactions} />
            </section>
        </div>
    );
}
