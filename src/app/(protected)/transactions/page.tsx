'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { AdvancedFilters } from '@/components/filters/AdvancedFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { TransactionRowSkeleton } from '@/components/ui/skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryId: string;
    description: string | null;
    transactionDate: string;
    category: {
        id: string;
        name: string;
    };
}

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const debouncedSearch = useDebounce(searchInput, 300);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | undefined>(undefined);

    const filters = {
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        start: searchParams.get('start') || '',
        end: searchParams.get('end') || '',
        min: searchParams.get('min') || '',
        max: searchParams.get('max') || '',
        sortBy: searchParams.get('sortBy') || 'transactionDate',
        sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['transactions', filters, debouncedSearch],
        queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
            const params = new URLSearchParams({
                limit: '15',
                search: debouncedSearch,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
            });
            if (pageParam) params.set('cursor', pageParam);

            const response = await fetch(`/api/transactions?${params}`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: null,
        staleTime: 60 * 1000, // 1 minute
    });

    const allTransactions = data?.pages.flatMap(page => page.transactions) || [];

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/transactions/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete transaction');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success('Transaction deleted');
            setDeletingTransaction(undefined);
        },
        onError: () => {
            toast.error('Failed to delete transaction');
        },
    });

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingTransaction(undefined);
        setIsFormOpen(true);
    };

    return (
        <ErrorBoundary>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transactions</h1>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">History of your wealth flow</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search description..."
                                className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-primary/20"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAdd} className="h-11 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-5 w-5" />
                            <span className="hidden sm:inline">Add Transaction</span>
                        </Button>
                    </div>
                </div>

                <AdvancedFilters />

                <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-3xl">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-900 h-14">Date</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-14">Description</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-14">Category</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-14">Type</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-14 text-right">Amount</TableHead>
                                    <TableHead className="font-bold text-slate-900 h-14 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(10).fill(0).map((_, i) => <TransactionRowSkeleton key={i} />)
                                ) : allTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                                                <Search className="h-12 w-12" />
                                                <p className="text-lg font-bold">No transactions found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {allTransactions.map((transaction) => (
                                            <TableRow key={transaction.id} className="group transition-colors hover:bg-slate-50/50 border-slate-50">
                                                <TableCell className="text-sm font-medium text-slate-600">
                                                    {formatDate(transaction.transactionDate)}
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900 max-w-[200px] truncate">
                                                    {transaction.description || <span className="text-slate-300 font-normal">No description</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-600 font-bold px-3 py-1">
                                                        {transaction.category.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.type === 'INCOME' ? 'success' : 'danger'} className="rounded-lg font-black uppercase text-[10px] tracking-widest px-2.5 py-1">
                                                        {transaction.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-black text-base">
                                                    <span className={transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}>
                                                        {transaction.type === 'INCOME' ? '+' : '-'}
                                                        {formatCurrency(transaction.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl hover:bg-blue-50 text-blue-600"
                                                            onClick={() => handleEdit(transaction)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl hover:bg-rose-50 text-rose-600"
                                                            onClick={() => setDeletingTransaction(transaction)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {isFetchingNextPage && Array(5).fill(0).map((_, i) => <TransactionRowSkeleton key={'loading-' + i} />)}
                                    </>
                                )}
                            </TableBody>
                        </Table>

                        {hasNextPage && (
                            <div className="p-8 flex justify-center border-t border-slate-50 bg-slate-50/30">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 h-12 px-8 border-2 border-slate-200 hover:bg-white hover:border-primary transition-all shadow-sm"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? <LoadingSpinner size="sm" /> : (
                                        <>
                                            <ArrowDown className="h-4 w-4" />
                                            Load More History
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <TransactionForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    transaction={editingTransaction}
                    onSuccess={() => { }}
                />

                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(undefined)}>
                    <DialogContent className="rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900">Confirm Deletion</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium pt-2">
                                This transaction will be permanently removed from your history. This action cannot be reversed.
                            </DialogDescription>
                        </DialogHeader>
                        {deletingTransaction && (
                            <div className="py-6 px-6 bg-slate-50 rounded-2xl my-4 space-y-4 border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Description</span>
                                    <span className="text-sm font-bold text-slate-900">{deletingTransaction.description || 'No description'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Amount</span>
                                    <span className={`text-base font-black ${deletingTransaction.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {deletingTransaction.type === 'INCOME' ? '+' : '-'}
                                        {formatCurrency(deletingTransaction.amount)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="gap-2">
                            <Button variant="outline" className="h-12 rounded-xl font-bold flex-1" onClick={() => setDeletingTransaction(undefined)}>
                                Keep it
                            </Button>
                            <Button
                                variant="danger"
                                className="h-12 rounded-xl font-black uppercase tracking-widest text-[11px] flex-1 shadow-lg shadow-rose-200"
                                onClick={() => deletingTransaction && deleteMutation.mutate(deletingTransaction.id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Delete Permanently'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ErrorBoundary>
    );
}
