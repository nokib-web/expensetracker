'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, Info, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ZakatCalculatorProps {
    onAddAsset?: (source: any, amount: number) => void;
}

export function ZakatCalculator({ onAddAsset }: ZakatCalculatorProps) {
    const [values, setValues] = useState({
        cash: '',
        savings: '',
        gold: '',
        investment: ''
    });

    const total = Object.values(values).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    const zakat = total * 0.025;

    const handleInputChange = (field: keyof typeof values, val: string) => {
        setValues(prev => ({ ...prev, [field]: val }));
    };

    return (
        <Card className="border-primary/20 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
            <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-primary">
                    <Calculator className="h-4 w-4" />
                    Interactive Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cash on Hand</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="h-9 focus-visible:ring-primary/30"
                            value={values.cash}
                            onChange={(e) => handleInputChange('cash', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Bank Savings</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="h-9 focus-visible:ring-primary/30"
                            value={values.savings}
                            onChange={(e) => handleInputChange('savings', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Gold Value</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="h-9 focus-visible:ring-primary/30"
                            value={values.gold}
                            onChange={(e) => handleInputChange('gold', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Investments</label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="h-9 focus-visible:ring-primary/30"
                            value={values.investment}
                            onChange={(e) => handleInputChange('investment', e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Info className="h-12 w-12" />
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold text-primary/70">Total Wealth</span>
                        <span className="text-xl font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t border-primary/10 flex justify-between items-end">
                        <span className="text-xs font-semibold text-primary/70">Zakat Due (2.5%)</span>
                        <span className="text-xl font-bold text-green-600">${zakat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground leading-relaxed italic px-1">
                    * This is a quick estimation. Zakat is calculated on wealth held for one lunar year above the Nisab threshold.
                </p>

                {onAddAsset && total > 0 && (
                    <Button
                        className="w-full h-10 gap-2 font-semibold shadow-lg shadow-primary/20"
                        variant="primary"
                        onClick={() => {
                            // For simplicity, adding the total as "CASH" if they use the quick calculator to add
                            onAddAsset('CASH', total);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Convert to Asset
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
