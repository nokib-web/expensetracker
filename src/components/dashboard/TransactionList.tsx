import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryName: string;
    description: string | null;
    transactionDate: Date | string;
}

interface TransactionListProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 animate-pulse">
                        <div className="h-10 w-10 rounded-xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-slate-100 rounded" />
                            <div className="h-3 w-32 bg-slate-100 rounded" />
                        </div>
                        <div className="h-5 w-16 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 px-6">
                <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-slate-200" />
                </div>
                <p className="font-black text-slate-900 tracking-tight">No transactions yet</p>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Start recording your wealth flow</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-50">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-0">Transaction</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Date</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-0">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="group border-slate-50">
                            <TableCell className="pl-0 py-4">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${transaction.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {transaction.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 leading-none group-hover:text-primary transition-colors">
                                            {transaction.description || 'No description'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-tight md:hidden">
                                            {transaction.categoryName} • {formatDate(new Date(transaction.transactionDate))}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 group-hover:bg-slate-100 transition-colors uppercase text-[9px] font-black tracking-widest px-2.5 py-1">
                                    {transaction.categoryName}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs font-bold text-slate-400">
                                {formatDate(new Date(transaction.transactionDate))}
                            </TableCell>
                            <TableCell className="text-right pr-0 font-black tracking-tight">
                                <span className={transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}>
                                    {transaction.type === 'INCOME' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="mt-8">
                <Link
                    href="/transactions"
                    className="flex items-center justify-center gap-2 py-3 w-full rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-slate-100 transition-all group"
                >
                    View Detailed History
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}

// Fixed imports for missing Lucide icons used in the new design
import { TrendingUp, TrendingDown } from 'lucide-react';
