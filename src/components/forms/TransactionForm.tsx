'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { CategorySelect } from '@/components/forms/CategorySelect';

const transactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.coerce.number().positive('Amount must be positive'),
    categoryId: z.string().uuid('Please select a category'),
    description: z.string().optional(),
    transactionDate: z.string(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'EXPENSE',
            transactionDate: new Date().toISOString().split('T')[0],
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
                transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
            });
        } else if (open) {
            reset({
                type: 'EXPENSE',
                amount: undefined,
                categoryId: '',
                description: '',
                transactionDate: new Date().toISOString().split('T')[0],
            });
        }
    }, [transaction, open, reset]);

    const onSubmit = async (data: TransactionFormValues) => {
        setIsSubmitting(true);
        try {
            const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
            const method = transaction ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            toast.success(`Transaction ${transaction ? 'updated' : 'added'} successfully`);
            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={selectedType === 'EXPENSE' ? 'danger' : 'outline'}
                            className="w-full"
                            onClick={() => {
                                setValue('type', 'EXPENSE');
                                setValue('categoryId', '');
                            }}
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={selectedType === 'INCOME' ? 'success' : 'outline'}
                            className="w-full"
                            onClick={() => {
                                setValue('type', 'INCOME');
                                setValue('categoryId', '');
                            }}
                        >
                            Income
                        </Button>
                    </div>

                    <Input
                        label="Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('amount')}
                        error={errors.amount?.message}
                    />

                    <CategorySelect
                        label="Category"
                        type={selectedType}
                        value={categoryId}
                        onChange={(val) => setValue('categoryId', val)}
                        error={errors.categoryId?.message}
                    />


                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            {...register('transactionDate')}
                            error={errors.transactionDate?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Lunch with friends..."
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                            {isLoading ? <LoadingSpinner size="sm" /> : transaction ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
