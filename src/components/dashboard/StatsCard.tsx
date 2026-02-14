import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconColor: string;
    change?: number;
    isLoading?: boolean;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    iconColor,
    change,
    isLoading,
}: StatsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className={`h-8 w-8 rounded-full bg-gray-200 animate-pulse`} />
                </CardHeader>
                <CardContent>
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </CardContent>
            </Card>
        );
    }

    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`p-2 rounded-full ${iconColor}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(value)}
                </div>
                {change !== undefined && (
                    <p
                        className={`text-xs mt-1 ${isPositive
                                ? 'text-green-600'
                                : isNegative
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                            }`}
                    >
                        {isPositive && '+'}
                        {change.toFixed(1)}% from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
