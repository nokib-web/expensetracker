import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TransactionsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>View and manage your income and expenses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-center py-8">
                            No transactions found. Click "Add Transaction" to get started!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
