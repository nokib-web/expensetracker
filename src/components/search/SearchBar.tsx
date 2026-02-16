'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, ArrowRight, History, CreditCard, Tag, Landmark, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function SearchBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(handler);
    }, [query]);

    // Fetch results
    const { data, isLoading } = useQuery({
        queryKey: ['global-search', debouncedQuery],
        queryFn: () => fetch(`/api/search?q=${debouncedQuery}`).then(res => res.json()),
        enabled: debouncedQuery.length >= 2,
    });

    // Recent searches (mock for now, could use localStorage)
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const saveToRecent = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-md mx-auto z-[60]" ref={dropdownRef}>
            <div className={cn(
                "relative flex items-center transition-all duration-200",
                isOpen ? "scale-[1.02] -translate-y-0.5" : ""
            )}>
                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.length >= 2) {
                            saveToRecent(query);
                            setIsOpen(false);
                            router.push(`/transactions?search=${query}`);
                        }
                    }}
                    placeholder="Search transactions, categories..."
                    className="w-full h-10 pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
                {isLoading ? (
                    <Loader2 className="absolute right-3 h-4 w-4 text-slate-400 animate-spin" />
                ) : query.length > 0 ? (
                    <button onClick={clearSearch} className="absolute right-3 p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="h-3 w-3 text-slate-500" />
                    </button>
                ) : null}
            </div>

            {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Results Area */}
                    <div className="max-h-[70vh] overflow-y-auto px-1 py-1">

                        {/* Recent Searches */}
                        {query.length < 2 && recentSearches.length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    <History className="h-3 w-3" />
                                    Recent Searches
                                </div>
                                {recentSearches.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            setQuery(term);
                                            setIsOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-sm text-slate-600 transition-colors"
                                    >
                                        <Search className="h-3.5 w-3.5 opacity-50" />
                                        {term}
                                    </button>
                                ))}
                            </div>
                        )}

                        {query.length >= 2 && data && (
                            <>
                                {/* Transactions Result */}
                                {data.transactions?.length > 0 && (
                                    <div className="p-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                                            <CreditCard className="h-3 w-3" />
                                            Transactions
                                        </div>
                                        {data.transactions.map((t: any) => (
                                            <Link
                                                key={t.id}
                                                href={`/transactions?id=${t.id}`}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    saveToRecent(query);
                                                }}
                                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{t.description}</span>
                                                    <span className="text-[10px] text-muted-foreground font-medium">{t.category?.name || 'Uncategorized'}</span>
                                                </div>
                                                <div className={cn(
                                                    "text-xs font-black",
                                                    t.type === 'INCOME' ? "text-emerald-600" : "text-slate-400"
                                                )}>
                                                    {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Categories Result */}
                                {data.categories?.length > 0 && (
                                    <div className="p-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                                            <Tag className="h-3 w-3" />
                                            Categories
                                        </div>
                                        {data.categories.map((c: any) => (
                                            <Link
                                                key={c.id}
                                                href={`/transactions?category=${c.id}`}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    saveToRecent(query);
                                                }}
                                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50/50 transition-colors group"
                                            >
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                                                <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-100 text-slate-400">
                                                    {c._count.transactions} Items
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Zakat Result */}
                                {data.zakatAssets?.length > 0 && (
                                    <div className="p-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">
                                            <Landmark className="h-3 w-3" />
                                            Zakat Assets
                                        </div>
                                        {data.zakatAssets.map((z: any) => (
                                            <Link
                                                key={z.id}
                                                href="/zakat"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    saveToRecent(query);
                                                }}
                                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-amber-50/50 transition-colors group"
                                            >
                                                <span className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{z.source}</span>
                                                <span className="text-xs font-black text-amber-600">${Number(z.amount).toFixed(2)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {(!data.transactions?.length && !data.categories?.length && !data.zakatAssets?.length) && !isLoading && (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-2xl mb-3">
                                            <Sparkles className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">No results found</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Try a different term or keywords.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 w-full py-1">
                            Advanced Transaction Search
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
