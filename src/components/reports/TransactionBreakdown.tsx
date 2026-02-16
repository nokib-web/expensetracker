'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, ListCollapse } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionBreakdownProps {
    transactions: any[];
}

export function TransactionBreakdown({ transactions }: TransactionBreakdownProps) {
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Group transactions by category
    const groups = transactions.reduce((acc, t) => {
        const categoryName = t.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
            acc[categoryName] = {
                id: t.categoryId,
                name: categoryName,
                total: 0,
                type: t.type,
                items: []
            };
        }
        acc[categoryName].total += Number(t.amount);
        acc[categoryName].items.push(t);
        return acc;
    }, {} as Record<string, { id: string, name: string, total: number, type: string, items: any[] }>);

    const sortedGroups = (Object.values(groups) as { id: string, name: string, total: number, type: string, items: any[] }[]).sort((a, b) => b.total - a.total);

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ListCollapse className="h-5 w-5 text-primary" />
                    Category Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent uppercase">
                            <TableHead className="w-[400px] text-[10px] font-black tracking-widest pl-12">Category</TableHead>
                            <TableHead className="text-right text-[10px] font-black tracking-widest pr-12">Total Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedGroups.map((group: any) => (
                            <div key={group.name} className="contents">
                                <TableRow
                                    className="cursor-pointer group hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleCategory(group.id)}
                                >
                                    <TableCell className="font-bold py-4">
                                        <div className="flex items-center gap-4">
                                            {expandedCategories.includes(group.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                            <span className={group.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}>
                                                {group.name}
                                            </span>
                                            <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                {group.items.length} transactions
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4 pr-12 font-black text-slate-900 dark:text-white">
                                        {group.type === 'INCOME' ? '+' : '-'}${group.total.toFixed(2)}
                                    </TableCell>
                                </TableRow>

                                {expandedCategories.includes(group.id) && (
                                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                                        <TableCell colSpan={2} className="p-0">
                                            <div className="divide-y divide-slate-100 animate-in slide-in-from-top-2 duration-200">
                                                {group.items.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center py-3 pl-16 pr-12 group/item hover:bg-white transition-colors">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.description || 'No description'}</span>
                                                            <span className="text-[10px] text-muted-foreground italic">{new Date(item.transactionDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <span className={`text-sm font-mono ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            ${Number(item.amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </div>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
