'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CalculationMethod } from '@prisma/client';
import toast from 'react-hot-toast';
import { Settings2, Save, RotateCcw, Scale } from 'lucide-react';

const settingsSchema = z.object({
    nisabAmount: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive('Nisab amount must be positive')
    ),
    calculationMethod: z.nativeEnum(CalculationMethod),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface NisabSettingsFormProps {
    initialData: {
        nisabAmount: number;
        calculationMethod: CalculationMethod;
    };
    onSuccess: () => void;
}

export function NisabSettingsForm({ initialData, onSuccess }: NisabSettingsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(settingsSchema) as any,
        defaultValues: {
            nisabAmount: Number(initialData.nisabAmount),
            calculationMethod: initialData.calculationMethod,
        },
    });

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/zakat/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            toast.success('Zakat settings updated');
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-base">Calculation Settings</CardTitle>
                        <CardDescription className="text-xs">Configure your Nisab and preferred calculation logic.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 pt-2">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Scale className="h-4 w-4 text-purple-500" />
                                <label className="text-sm font-semibold">Nisab Threshold (USD)</label>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('nisabAmount')}
                                error={errors.nisabAmount?.message}
                                className="font-mono"
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Equivalent to 87.48g of Gold or 612.36g of Silver.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Calculation Method</label>
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Button
                                    type="button"
                                    variant={initialData.calculationMethod === 'AUTOMATIC' ? 'primary' : 'ghost'}
                                    className="flex-1 h-9 text-xs"
                                    onClick={() => setValue('calculationMethod', 'AUTOMATIC')}
                                >
                                    Automatic
                                </Button>
                                <Button
                                    type="button"
                                    variant={initialData.calculationMethod === 'MANUAL' ? 'primary' : 'ghost'}
                                    className="flex-1 h-9 text-xs"
                                    onClick={() => setValue('calculationMethod', 'MANUAL')}
                                >
                                    Manual
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                Automatic includes your income/expense balance in eligibility.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => reset()}
                            className="h-9 gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 gap-2">
                            {isSubmitting ? <LoadingSpinner size="sm" /> : <><Save className="h-4 w-4" /> Save Changes</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
