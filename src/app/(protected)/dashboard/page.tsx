'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Wallet, Coins } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { QuickActions } from '@/components/dashboard/QuickActions';

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

export default function DashboardPage() {
    const router = useRouter();

    const { data, isLoading, error } = useQuery<DashboardData>({
        queryKey: ['dashboard-summary'],
        queryFn: async () => {
            const response = await fetch('/api/dashboard/summary');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            return response.json();
        },
    });

    if (error) {
        toast.error('Failed to load dashboard data');
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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back! Here's your financial overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Income"
                    value={data?.totalIncome || 0}
                    icon={TrendingUp}
                    iconColor="bg-green-600"
                    change={data?.incomeChange}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Total Expenses"
                    value={data?.totalExpenses || 0}
                    icon={TrendingDown}
                    iconColor="bg-red-600"
                    change={data?.expenseChange}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Current Balance"
                    value={data?.currentBalance || 0}
                    icon={Wallet}
                    iconColor="bg-blue-600"
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Zakat Due"
                    value={data?.zakatDue || 0}
                    icon={Coins}
                    iconColor="bg-purple-600"
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
            <TransactionList
                transactions={data?.recentTransactions || []}
                isLoading={isLoading}
            />
        </div>
    );
}
