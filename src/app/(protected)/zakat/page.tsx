'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Coins,
    Wallet,
    Scale,
    HandHelping,
    History,
    Plus,
    Trash2,
    Edit2,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ZakatEligibilityBadge } from '@/components/zakat/ZakatEligibilityBadge';
import { ZakatProgressBar } from '@/components/zakat/ZakatProgressBar';
import { AssetBreakdownChart } from '@/components/zakat/AssetBreakdownChart';
import { ZakatCalculator } from '@/components/zakat/ZakatCalculator';
import { AddAssetForm } from '@/components/zakat/AddAssetForm';
import { RecordPaymentForm } from '@/components/zakat/RecordPaymentForm';
import { NisabSettingsForm } from '@/components/zakat/NisabSettingsForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ZakatDashboard() {
    const queryClient = useQueryClient();
    const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Fetch Summary
    const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
        queryKey: ['zakat-summary'],
        queryFn: () => fetch('/api/zakat/summary').then(res => res.json())
    });

    // Fetch Assets
    const { data: assetsData, isLoading: isAssetsLoading } = useQuery({
        queryKey: ['zakat-assets'],
        queryFn: () => fetch('/api/zakat/assets').then(res => res.json())
    });

    // Fetch Payments
    const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
        queryKey: ['zakat-payments'],
        queryFn: () => fetch('/api/zakat/payments').then(res => res.json())
    });

    // Delete Asset Mutation
    const deleteAssetMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/zakat/assets/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zakat-assets'] });
            queryClient.invalidateQueries({ queryKey: ['zakat-summary'] });
            toast.success('Asset deleted');
        }
    });

    if (isSummaryLoading || isAssetsLoading || isPaymentsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LoadingSpinner size="lg" className="text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium tracking-tight">Gathering your Zakat overview...</p>
            </div>
        );
    }

    const summary = summaryData?.summary || {};
    const groupedAssets = assetsData || {};
    const paymentHistory = paymentsData || {};

    const formatCurrency = (val: any) => {
        const num = Number(val || 0);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    const handleAddAssetFromCalc = async (source: string, amount: number) => {
        try {
            const response = await fetch('/api/zakat/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, amount })
            });
            if (response.ok) {
                queryClient.invalidateQueries({ queryKey: ['zakat-assets'] });
                queryClient.invalidateQueries({ queryKey: ['zakat-summary'] });
                toast.success('Added to assets successfully');
            }
        } catch (error) {
            toast.error('Failed to add asset');
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Zakat Dashboard</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Manage your purification and charity goals.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="h-11 px-5 border-slate-200 shadow-sm"
                    >
                        {isSettingsOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Settings
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white h-11 px-6 shadow-lg shadow-primary/25 font-bold"
                        onClick={() => setIsRecordPaymentOpen(true)}
                    >
                        <HandHelping className="h-4 w-4 mr-2" />
                        Pay Zakat
                    </Button>
                </div>
            </div>

            {/* Collapsible Settings */}
            {isSettingsOpen && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top duration-300">
                    <NisabSettingsForm
                        initialData={{
                            nisabAmount: summary.nisabAmount,
                            calculationMethod: summary.calculationMethod || 'AUTOMATIC'
                        }}
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['zakat-summary'] });
                            setIsSettingsOpen(false);
                        }}
                    />
                </div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl shadow-blue-500/5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Assets</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.eligibleAmount)}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                            <span>{formatCurrency(summary.totalAssets)} Assets</span>
                            <Plus className="h-2 w-2" />
                            <span>{formatCurrency(summary.netBalance)} Balance</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-purple-500/5 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-purple-600">Nisab Threshold</CardTitle>
                        <Scale className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.nisabAmount)}</div>
                        <div className="mt-2">
                            <ZakatEligibilityBadge isEligible={summary.meetsNisab} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-emerald-500/5 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600">Zakat Payable</CardTitle>
                        <Coins className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.zakatPayable)}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Calculated at {summary.zakatRate}% of eligible wealth.</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-orange-500/5 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-600">Amount Due</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.zakatDue)}</div>
                        <div className="mt-2">
                            {Number(summary.zakatDue) <= 0 ? (
                                <Badge variant="success" className="flex items-center gap-1 w-fit px-3 py-1 bg-emerald-100 text-emerald-700 font-bold border-none">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Fully Paid
                                </Badge>
                            ) : (
                                <ZakatProgressBar paid={Number(summary.zakatPaid)} payable={Number(summary.zakatPayable)} className="mt-2" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Columns - Tables */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Assets Breakdown */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 px-6 py-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Assets Inventory</CardTitle>
                                <p className="text-xs text-muted-foreground">Fixed assets eligible for Zakat calculation.</p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setIsAddAssetOpen(true)}
                                className="h-9 px-4 rounded-lg font-bold"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Asset
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {Object.keys(groupedAssets).length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground font-medium italic">
                                    No assets recorded. Start by adding your cash, gold, or business investments.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {Object.entries(groupedAssets).map(([source, assets]: [any, any]) => (
                                        <div key={source} className="group">
                                            <div className="bg-slate-50/30 px-6 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>{source}</span>
                                                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                                                    Total: {formatCurrency(assets.reduce((sum: number, a: any) => sum + Number(a.amount), 0))}
                                                </span>
                                            </div>
                                            <Table>
                                                <TableBody>
                                                    {assets.map((asset: any) => (
                                                        <TableRow key={asset.id} className="hover:bg-slate-50/50">
                                                            <TableCell className="pl-6 py-4">
                                                                <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(asset.amount)}</div>
                                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {format(new Date(asset.date), 'MMM dd, yyyy')}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => {
                                                                            setEditingAsset(asset);
                                                                            setIsAddAssetOpen(true);
                                                                        }}
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => deleteAssetMutation.mutate(asset.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 px-6 py-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-slate-400" />
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {Object.keys(paymentHistory).length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground font-medium italic">
                                    No payments recorded yet for this year.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {Object.entries(paymentHistory).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, data]: [string, any]) => (
                                        <div key={year}>
                                            <div className="bg-slate-50/30 px-6 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Year {year}</span>
                                                <span className="text-emerald-600">Total Paid: {formatCurrency(data.totalPaid)}</span>
                                            </div>
                                            <Table>
                                                <TableBody>
                                                    {data.payments.map((payment: any) => (
                                                        <TableRow key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="pl-6 py-4">
                                                                <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amountPaid)}</div>
                                                                <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px] text-xs text-muted-foreground italic">
                                                                {payment.notes || 'No notes'}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 inline-block" />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar Widgets */}
                <div className="space-y-8">

                    {/* Visual Breakdown */}
                    <AssetBreakdownChart
                        data={Object.entries(groupedAssets).map(([source, assets]: [string, any]) => ({
                            source,
                            amount: assets.reduce((sum: number, a: any) => sum + Number(a.amount), 0)
                        }))}
                    />

                    {/* Quick Calculator */}
                    <ZakatCalculator onAddAsset={handleAddAssetFromCalc} />

                    {/* Formula Info */}
                    <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20 overflow-hidden relative">
                        <div className="absolute -right-8 -bottom-8 opacity-10">
                            <ArrowRight className="h-32 w-32 -rotate-45" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Your Calculation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="text-xs space-y-2 font-medium">
                                <p className="flex justify-between items-center opacity-90">
                                    <span>Eligible Wealth:</span>
                                    <span className="font-bold">{formatCurrency(summary.eligibleAmount)}</span>
                                </p>
                                <p className="flex justify-between items-center opacity-90">
                                    <span>Zakat Rate:</span>
                                    <span className="font-bold">{summary.zakatRate}%</span>
                                </p>
                                <div className="h-px bg-white/20 my-2" />
                                <p className="flex justify-between items-center text-sm">
                                    <span>Zakat Payable:</span>
                                    <span className="text-xl font-black">{formatCurrency(summary.zakatPayable)}</span>
                                </p>
                                <p className="flex justify-between items-center opacity-80 pt-1">
                                    <span>Total Paid ({new Date().getFullYear()}):</span>
                                    <span className="font-bold">{formatCurrency(summary.zakatPaid)}</span>
                                </p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <p className="text-[11px] leading-relaxed italic opacity-95">
                                    "Your wealth is not what you earn, it's what you give for the sake of Allah."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <AddAssetForm
                open={isAddAssetOpen}
                onOpenChange={(open) => {
                    setIsAddAssetOpen(open);
                    if (!open) setEditingAsset(null);
                }}
                asset={editingAsset}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['zakat-assets'] });
                    queryClient.invalidateQueries({ queryKey: ['zakat-summary'] });
                }}
            />

            <RecordPaymentForm
                open={isRecordPaymentOpen}
                onOpenChange={setIsRecordPaymentOpen}
                suggestedAmount={Number(summary.zakatDue)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['zakat-payments'] });
                    queryClient.invalidateQueries({ queryKey: ['zakat-summary'] });
                }}
            />
        </div>
    );
}
