'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import dynamic from 'next/dynamic';
import { DashboardHeaderSkeleton, StatsGridSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { api } from '@/lib/api-client';

const ExpenseChart = dynamic(() => import('@/components/dashboard/ExpenseChart').then(mod => mod.ExpenseChart), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

interface DashboardData {
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    thisMonthIncome: number;
    thisMonthExpenses: number;
    incomeChange: number;
    expenseChange: number;
    topSpendingCategories: Array<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }>;
    recentTransactions: Array<{
        id: string;
        type: 'INCOME' | 'EXPENSE';
        amount: number;
        categoryName: string;
        description: string | null;
        transactionDate: Date | string;
    }>;
    zakatEligible: boolean;
    zakatDue: number;
}

interface ApiResponse {
    success: boolean;
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    thisMonthIncome: number;
    thisMonthExpenses: number;
    incomeChange: number;
    expenseChange: number;
    topSpendingCategories: Array<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }>;
    recentTransactions: Array<{
        id: string;
        type: 'INCOME' | 'EXPENSE';
        amount: number;
        categoryName: string;
        description: string | null;
        transactionDate: Date | string;
    }>;
    zakatEligible: boolean;
    zakatDue: number;
}

export default function DashboardPage() {
    const router = useRouter();

    const { data, isLoading } = useQuery<ApiResponse>({
        queryKey: ['dashboard-summary'],
        queryFn: () => api.get<ApiResponse>('/api/dashboard/summary'),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) {
        return (
            <div className="space-y-8 px-4 sm:px-0">
                <DashboardHeaderSkeleton />
                <StatsGridSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ChartSkeleton />
                    </div>
                    <div className="h-[400px] p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50">
                        <ListSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    const handleAddIncome = () => {
        router.push('/transactions?type=income');
    };

    const handleAddExpense = () => {
        router.push('/transactions?type=expense');
    };

    const handlePayZakat = () => {
        router.push('/zakat');
    };

    return (
        <ErrorBoundary>
            <div className="space-y-8 px-4 sm:px-0 pb-12 animate-in fade-in duration-500">
                <div className="flex flex-col space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Pulse of your personal economy
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Income"
                        value={data?.totalIncome || 0}
                        icon={TrendingUp}
                        iconColor="bg-emerald-500"
                        change={data?.incomeChange}
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Total Expenses"
                        value={data?.totalExpenses || 0}
                        icon={TrendingDown}
                        iconColor="bg-rose-500"
                        change={data?.expenseChange}
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Current Balance"
                        value={data?.currentBalance || 0}
                        icon={Wallet}
                        iconColor="bg-blue-500"
                        isLoading={isLoading}
                    />
                    <StatsCard
                        title="Zakat Due"
                        value={data?.zakatDue || 0}
                        icon={Coins}
                        iconColor="bg-amber-500"
                        isLoading={isLoading}
                    />
                </div>

                {/* Charts and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ExpenseChart
                            data={data?.topSpendingCategories || []}
                            isLoading={isLoading}
                        />
                    </div>
                    <div>
                        <QuickActions
                            zakatDue={data?.zakatDue}
                            onAddIncome={handleAddIncome}
                            onAddExpense={handleAddExpense}
                            onPayZakat={handlePayZakat}
                        />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        Recent Activity
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                    </h2>
                    <TransactionList
                        transactions={data?.recentTransactions || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </ErrorBoundary>
    );
}
