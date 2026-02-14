import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, TrendingUp, Coins } from 'lucide-react';

interface QuickActionsProps {
    zakatDue?: number;
    onAddIncome?: () => void;
    onAddExpense?: () => void;
    onPayZakat?: () => void;
}

export function QuickActions({
    zakatDue = 0,
    onAddIncome,
    onAddExpense,
    onPayZakat,
}: QuickActionsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    onClick={onAddIncome}
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Add Income
                </Button>
                <Button
                    onClick={onAddExpense}
                    className="w-full justify-start bg-red-600 hover:bg-red-700"
                >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Add Expense
                </Button>
                {zakatDue > 0 && (
                    <Button
                        onClick={onPayZakat}
                        className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                    >
                        <Coins className="h-4 w-4 mr-2" />
                        Pay Zakat
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
