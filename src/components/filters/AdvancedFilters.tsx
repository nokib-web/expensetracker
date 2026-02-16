'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown, Calendar, Tag, ArrowUpDown, Trash2, ListFilter, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function AdvancedFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Filter State
    const [type, setType] = useState(searchParams.get('type') || '');
    const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
    const [startDate, setStartDate] = useState(searchParams.get('start') || '');
    const [endDate, setEndDate] = useState(searchParams.get('end') || '');
    const [minAmount, setMinAmount] = useState(searchParams.get('min') || '');
    const [maxAmount, setMaxAmount] = useState(searchParams.get('max') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'transactionDate');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

    // Categories for dropdown
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => fetch('/api/categories').then(res => res.json())
    });

    // Calculate active filter count
    const activeCount = [type, categoryId, startDate, endDate, minAmount, maxAmount].filter(Boolean).length;

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (type) params.set('type', type); else params.delete('type');
        if (categoryId) params.set('category', categoryId); else params.delete('category');
        if (startDate) params.set('start', startDate); else params.delete('start');
        if (endDate) params.set('end', endDate); else params.delete('end');
        if (minAmount) params.set('min', minAmount); else params.delete('min');
        if (maxAmount) params.set('max', maxAmount); else params.delete('max');
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);

        router.push(`/transactions?${params.toString()}`);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setType('');
        setCategoryId('');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('transactionDate');
        setSortOrder('desc');
        router.push('/transactions');
    };

    const removeFilter = (key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`/transactions?${params.toString()}`);

        // Update local state
        if (key === 'type') setType('');
        if (key === 'category') setCategoryId('');
        if (key === 'start') setStartDate('');
        if (key === 'end') setEndDate('');
        if (key === 'min') setMinAmount('');
        if (key === 'max') setMaxAmount('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={isOpen ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-9 gap-2 font-bold relative"
                    >
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                        {activeCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white ring-2 ring-white">
                                {activeCount}
                            </span>
                        )}
                    </Button>

                    {/* Applied Filter Chips */}
                    {searchParams.get('type') && (
                        <Badge variant="default" className="h-8 gap-1 pl-3 pr-1 bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px] font-black">
                            Type: {searchParams.get('type')}
                            <X className="h-3 w-3 cursor-pointer hover:text-blue-900" onClick={() => removeFilter('type')} />
                        </Badge>
                    )}
                    {searchParams.get('category') && (
                        <Badge variant="default" className="h-8 gap-1 pl-3 pr-1 bg-purple-50 text-purple-700 border-purple-100 uppercase text-[10px] font-black">
                            Category: {categories?.find((c: any) => c.id === searchParams.get('category'))?.name || 'Selected'}
                            <X className="h-3 w-3 cursor-pointer hover:text-purple-900" onClick={() => removeFilter('category')} />
                        </Badge>
                    )}
                    {searchParams.get('min') && (
                        <Badge variant="default" className="h-8 gap-1 pl-3 pr-1 bg-amber-50 text-amber-700 border-amber-100 uppercase text-[10px] font-black">
                            Min: ${searchParams.get('min')}
                            <X className="h-3 w-3 cursor-pointer hover:text-amber-900" onClick={() => removeFilter('min')} />
                        </Badge>
                    )}
                    {activeCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 gap-1">
                            <Trash2 className="h-3 w-3" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-4 duration-300">

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <CreditCard className="h-3 w-3" />
                            Transaction Type
                        </label>
                        <div className="flex gap-2">
                            {['INCOME', 'EXPENSE'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(type === t ? '' : t)}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                                        type === t
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Tag className="h-3 w-3" />
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Date Range
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1 h-10 px-2 rounded-lg border border-slate-200 text-xs"
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1 h-10 px-2 rounded-lg border border-slate-200 text-xs"
                            />
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ArrowUpDown className="h-3 w-3" />
                            Amount Range
                        </label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-xs"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-xs"
                            />
                        </div>
                    </div>

                    {/* Sorting */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <ListFilter className="h-3 w-3" />
                            Sort By
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 h-10 px-2 rounded-lg border border-slate-200 bg-white text-xs"
                            >
                                <option value="transactionDate">Date</option>
                                <option value="amount">Amount</option>
                                <option value="description">Description</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-24 h-10 px-2 rounded-lg border border-slate-200 bg-white text-xs"
                            >
                                <option value="desc">DESC</option>
                                <option value="asc">ASC</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button variant="primary" className="px-8 font-black shadow-lg shadow-primary/25" onClick={applyFilters}>Apply Filters</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
