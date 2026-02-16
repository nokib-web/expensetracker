'use client';

import { useState, useEffect } from 'react';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import { HelpingHand } from 'lucide-react';

const paymentSchema = z.object({
    amountPaid: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive('Amount must be positive')
    ),
    paymentDate: z.string(),
    notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecordPaymentFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestedAmount: number;
    onSuccess: () => void;
}

export function RecordPaymentForm({ open, onOpenChange, suggestedAmount, onSuccess }: RecordPaymentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PaymentFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                amountPaid: suggestedAmount > 0 ? Number(suggestedAmount) : undefined,
                paymentDate: new Date().toISOString().split('T')[0],
                notes: '',
            });
        }
    }, [open, suggestedAmount, reset]);

    const onSubmit = async (data: PaymentFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/zakat/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            toast.success('Zakat payment recorded successfully');
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
                    <DialogTitle className="flex items-center gap-2">
                        <HelpingHand className="h-5 w-5 text-green-600" />
                        Record Zakat Payment
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Amount Paid</label>
                            {suggestedAmount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setValue('amountPaid', suggestedAmount)}
                                    className="text-[10px] text-blue-600 hover:underline"
                                >
                                    Use total due: ${suggestedAmount.toFixed(2)}
                                </button>
                            )}
                        </div>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amountPaid')}
                            error={errors.amountPaid?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Date</label>
                        <Input
                            type="date"
                            {...register('paymentDate')}
                            error={errors.paymentDate?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Beneficiary, charity name, etc."
                            {...register('notes')}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-green-600 hover:bg-green-700">
                            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
