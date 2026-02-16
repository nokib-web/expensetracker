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
import { AssetSource } from '@prisma/client';
import toast from 'react-hot-toast';
import { Coins, Landmark, Sparkles, Briefcase, Calculator } from 'lucide-react';

const assetSchema = z.object({
    source: z.nativeEnum(AssetSource),
    amount: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive('Amount must be positive')
    ),
    date: z.string(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface ZakatAsset {
    id: string;
    source: AssetSource;
    amount: number;
    date: string;
}

interface AddAssetFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset?: ZakatAsset;
    onSuccess: () => void;
}

export function AddAssetForm({ open, onOpenChange, asset, onSuccess }: AddAssetFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGoldCalc, setShowGoldCalc] = useState(false);
    const [goldGrams, setGoldGrams] = useState<string>('');
    const [goldPrice, setGoldPrice] = useState<string>('');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AssetFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(assetSchema) as any,
        defaultValues: {
            source: AssetSource.CASH,
            date: new Date().toISOString().split('T')[0],
        },
    });

    const selectedSource = watch('source');

    useEffect(() => {
        if (asset) {
            reset({
                source: asset.source,
                amount: asset.amount,
                date: new Date(asset.date).toISOString().split('T')[0],
            });
        } else if (open) {
            reset({
                source: AssetSource.CASH,
                amount: undefined,
                date: new Date().toISOString().split('T')[0],
            });
        }
    }, [asset, open, reset]);

    const calculateGoldValue = () => {
        const grams = parseFloat(goldGrams);
        const price = parseFloat(goldPrice);
        if (!isNaN(grams) && !isNaN(price)) {
            setValue('amount', grams * price);
            setShowGoldCalc(false);
            setGoldGrams('');
            setGoldPrice('');
        } else {
            toast.error('Please enter valid numbers for gold calculation');
        }
    };

    const onSubmit = async (data: AssetFormValues) => {
        setIsSubmitting(true);
        try {
            const url = asset ? `/api/zakat/assets/${asset.id}` : '/api/zakat/assets';
            const method = asset ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            toast.success(`Asset ${asset ? 'updated' : 'added'} successfully`);
            onSuccess();
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sourceOptions = [
        { value: AssetSource.CASH, label: 'Cash', icon: Coins },
        { value: AssetSource.SAVINGS, label: 'Savings', icon: Landmark },
        { value: AssetSource.GOLD, label: 'Gold', icon: Sparkles },
        { value: AssetSource.INVESTMENT, label: 'Investment', icon: Briefcase },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{asset ? 'Edit Zakat Asset' : 'Add Zakat Asset'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-2">
                        {sourceOptions.map((opt) => (
                            <Button
                                key={opt.value}
                                type="button"
                                variant={selectedSource === opt.value ? 'primary' : 'outline'}
                                className="flex items-center gap-2 justify-start h-10 px-3"
                                onClick={() => setValue('source', opt.value)}
                            >
                                <opt.icon className="h-4 w-4" />
                                <span className="text-xs">{opt.label}</span>
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Amount</label>
                            {selectedSource === AssetSource.GOLD && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1"
                                    onClick={() => setShowGoldCalc(!showGoldCalc)}
                                >
                                    <Calculator className="h-3 w-3" />
                                    Gold Calculator
                                </Button>
                            )}
                        </div>

                        {showGoldCalc && (
                            <div className="p-3 bg-muted rounded-md space-y-3 mb-2 border border-dashed border-primary/50">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium uppercase">Grams</label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="87.48"
                                            value={goldGrams}
                                            onChange={(e) => setGoldGrams(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium uppercase">Price/Gram</label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="75.00"
                                            value={goldPrice}
                                            onChange={(e) => setGoldPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="w-full h-8 text-xs"
                                    onClick={calculateGoldValue}
                                >
                                    Apply Calculation
                                </Button>
                            </div>
                        )}

                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount')}
                            error={errors.amount?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date Acquired</label>
                        <Input
                            type="date"
                            {...register('date')}
                            error={errors.date?.message}
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
                        <Button type="submit" disabled={isSubmitting} className="min-w-[100px]">
                            {isSubmitting ? <LoadingSpinner size="sm" /> : asset ? 'Update' : 'Add Asset'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
