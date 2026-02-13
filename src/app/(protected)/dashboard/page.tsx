import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function DashboardPage() {
    // TODO: Fetch actual data from API
    const stats = {
        totalIncome: 5000,
        totalExpenses: 3200,
        balance: 1800,
        zakatDue: 125,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-[--color-success]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[--color-success]">
                                ${stats.totalIncome.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-[--color-danger]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[--color-danger]">
                                ${stats.totalExpenses.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-[--color-primary]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[--color-primary]">
                                ${stats.balance.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500">Net worth</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Zakat Due</CardTitle>
                            <DollarSign className="h-4 w-4 text-[--color-warning]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[--color-warning]">
                                ${stats.zakatDue.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500">2.5% of eligible wealth</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your latest financial activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-center py-8">
                            No transactions yet. Start by adding your first transaction!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
