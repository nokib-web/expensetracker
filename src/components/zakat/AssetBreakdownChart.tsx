"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetBreakdownChartProps {
    data: {
        source: string;
        amount: number;
    }[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function AssetBreakdownChart({ data }: AssetBreakdownChartProps) {
    const chartData = data.filter(d => d.amount > 0);

    if (chartData.length === 0) {
        return (
            <Card className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p>No assets recorded yet.</p>
                <p className="text-xs">Add your assets to see the breakdown.</p>
            </Card>
        );
    }

    return (
        <Card className="h-full border-none bg-transparent shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight">Asset Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="amount"
                                nameKey="source"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => value !== undefined ? `$${Number(value).toFixed(2)}` : ''}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
