'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { CategorySelect } from '@/components/forms/CategorySelect';
import { TransactionSchema, type TransactionValues } from '@/lib/validations';
import { api } from '@/lib/api-client';

interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    categoryId: string;
    description: string | null;
    transactionDate: string;
}

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: Transaction;
    onSuccess: () => void;
}

export function TransactionForm({
    open,
    onOpenChange,
    transaction,
    onSuccess,
}: TransactionFormProps) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<TransactionValues>({
        resolver: zodResolver(TransactionSchema),
        mode: 'onChange',
        defaultValues: {
            type: 'EXPENSE',
            transactionDate: new Date(),
        },
    });

    const selectedType = watch('type');
    const categoryId = watch('categoryId');

    useEffect(() => {
        if (transaction) {
            reset({
                type: transaction.type,
                amount: transaction.amount,
                categoryId: transaction.categoryId,
                description: transaction.description || '',
                transactionDate: new Date(transaction.transactionDate),
            });
        } else if (open) {
            reset({
                type: 'EXPENSE',
                amount: undefined as any,
                categoryId: '',
                description: '',
                transactionDate: new Date(),
            });
        }
    }, [transaction, open, reset]);

    const mutation = useMutation({
        mutationFn: async (data: TransactionValues) => {
            const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
            if (transaction) {
                return api.put(url, data);
            } else {
                return api.post(url, data);
            }
        },
        onMutate: async (newTransaction) => {
            await queryClient.cancelQueries({ queryKey: ['transactions'] });
            const previousTransactions = queryClient.getQueryData(['transactions']);

            if (!transaction) { // Optimistic only for 'Add'
                queryClient.setQueryData(['transactions'], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    transactions: [
                                        {
                                            id: 'temp-' + Date.now(),
                                            ...newTransaction,
                                            transactionDate: newTransaction.transactionDate.toISOString(),
                                            category: { id: newTransaction.categoryId, name: 'Saving...' }
                                        },
                                        ...page.transactions
                                    ]
                                };
                            }
                            return page;
                        })
                    };
                });
            }
            return { previousTransactions };
        },
        onError: (err, _, context) => {
            queryClient.setQueryData(['transactions'], context?.previousTransactions);
            toast.error(err.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            toast.success(`Transaction ${transaction ? 'updated' : 'added'} successfully`);
            onOpenChange(false);
            reset();
            onSuccess();
        },
    });

    const onSubmit = (data: TransactionValues) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant={selectedType === 'EXPENSE' ? 'danger' : 'outline'}
                            className={`h-12 rounded-xl font-bold transition-all ${selectedType === 'EXPENSE' ? 'shadow-lg shadow-rose-200' : ''}`}
                            onClick={() => {
                                setValue('type', 'EXPENSE', { shouldValidate: true });
                                setValue('categoryId', '', { shouldValidate: true });
                            }}
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={selectedType === 'INCOME' ? 'success' : 'outline'}
                            className={`h-12 rounded-xl font-bold transition-all ${selectedType === 'INCOME' ? 'shadow-lg shadow-emerald-200' : ''}`}
                            onClick={() => {
                                setValue('type', 'INCOME', { shouldValidate: true });
                                setValue('categoryId', '', { shouldValidate: true });
                            }}
                        >
                            Income
                        </Button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider ml-1">Amount</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 text-lg font-bold"
                            {...register('amount')}
                        />
                        {errors.amount && (
                            <p className="text-xs font-bold text-rose-600 ml-1">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider ml-1">Category</label>
                        <CategorySelect
                            type={selectedType}
                            value={categoryId}
                            onChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
                        />
                        {errors.categoryId && (
                            <p className="text-xs font-bold text-rose-600 ml-1">{errors.categoryId.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider ml-1">Date</label>
                        <Input
                            type="date"
                            className="h-12 rounded-xl border-slate-200 focus:ring-primary/20 font-medium"
                            defaultValue={watch('transactionDate')?.toISOString().split('T')[0]}
                            onChange={(e) => setValue('transactionDate', new Date(e.target.value), { shouldValidate: true })}
                        />
                        {errors.transactionDate && (
                            <p className="text-xs font-bold text-rose-600 ml-1">{errors.transactionDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider ml-1">Description (Optional)</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Lunch with friends..."
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-xs font-bold text-rose-600 ml-1">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-2 gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-xl font-bold sm:flex-1"
                            onClick={() => onOpenChange(false)}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending || !isValid}
                            className="h-12 rounded-xl font-black uppercase tracking-widest text-[11px] sm:flex-1 shadow-lg shadow-primary/20"
                        >
                            {mutation.isPending ? <LoadingSpinner size="sm" /> : transaction ? 'Update Transaction' : 'Add Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
