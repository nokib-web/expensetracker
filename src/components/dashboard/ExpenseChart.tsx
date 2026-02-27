import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { ChartSkeleton } from '@/components/ui/skeletons';

interface CategoryData {
    categoryName: string;
    amount: number;
}

interface ExpenseChartProps {
    data: CategoryData[];
    isLoading?: boolean;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const GRADIENTS = [
    { start: '#3b82f6', end: '#2563eb' },
    { start: '#34d399', end: '#10b981' },
    { start: '#fbbf24', end: '#f59e0b' },
    { start: '#f87171', end: '#ef4444' },
    { start: '#a78bfa', end: '#8b5cf6' },
];

export function ExpenseChart({ data, isLoading }: ExpenseChartProps) {
    if (isLoading) return <ChartSkeleton />;

    if (data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Distribution of your spending</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex flex-col items-center justify-center space-y-4 opacity-40">
                    <div className="h-24 w-24 rounded-full border-4 border-dashed border-slate-200" />
                    <p className="font-bold text-slate-400">No data available yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Insights into your wallet</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                    30 Days
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {GRADIENTS.map((g, i) => (
                                    <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={g.start} />
                                        <stop offset="100%" stopColor={g.end} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="amount"
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#grad-${index % GRADIENTS.length})`}
                                        className="transition-all duration-300 hover:opacity-80"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-xl border border-slate-100 p-3 animate-in zoom-in-95 duration-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                                    {payload[0].name}
                                                </p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                                    {formatCurrency(payload[0].value as number)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 space-y-3">
                    {data.slice(0, 4).map((item, index) => (
                        <div key={item.categoryName} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                                    {item.categoryName}
                                </span>
                            </div>
                            <span className="text-xs font-black text-slate-900">
                                {formatCurrency(item.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
