'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Pagination } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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

interface TransactionsResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
    };
}


export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = parseInt(searchParams.get('page') || '1');
    const filters = {
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        start: searchParams.get('start') || '',
        end: searchParams.get('end') || '',
        min: searchParams.get('min') || '',
        max: searchParams.get('max') || '',
        sortBy: searchParams.get('sortBy') || 'transactionDate',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        search: searchParams.get('search') || '',
    };

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | undefined>(undefined);

    const { data, isLoading } = useQuery<TransactionsResponse>({
        queryKey: ['transactions', page, filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
            });
            const response = await fetch(`/api/transactions?${params}`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return response.json();
        },
    });

    const setPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-gray-600 mt-1">Manage your income and expenses</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                </Button>
            </div>

            <AdvancedFilters />

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex justify-center">
                                            <LoadingSpinner size="lg" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data?.transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-gray-500">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="text-sm text-gray-600">
                                            {formatDate(transaction.transactionDate)}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate">
                                            {transaction.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{transaction.category.name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === 'INCOME' ? 'success' : 'danger'}>
                                                {transaction.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                                {transaction.type === 'INCOME' ? '+' : '-'}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(transaction)}
                                                >
                                                    <Edit2 className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingTransaction(transaction)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {data && (
                <Pagination
                    currentPage={page}
                    totalPages={data.pagination.pages}
                    onPageChange={setPage}
                    totalItems={data.pagination.total}
                    limit={data.pagination.limit}
                />
            )}

            <TransactionForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                transaction={editingTransaction}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['transactions'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
                }}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(undefined)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingTransaction && (
                        <div className="py-4 border-y my-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Description:</span>
                                <span className="text-sm font-medium">{deletingTransaction.description || 'No description'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Amount:</span>
                                <span className={`text-sm font-bold ${deletingTransaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                    {deletingTransaction.type === 'INCOME' ? '+' : '-'}
                                    {formatCurrency(deletingTransaction.amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Date:</span>
                                <span className="text-sm">{formatDate(deletingTransaction.transactionDate)}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingTransaction(undefined)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => deletingTransaction && deleteMutation.mutate(deletingTransaction.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Delete Transaction'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
