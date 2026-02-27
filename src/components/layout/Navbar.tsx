'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { SearchBar } from '@/components/search/SearchBar';
import { NotificationBell } from '@/components/layout/NotificationBell';

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Reports', href: '/reports' },
    { name: 'Zakat', href: '/zakat' },
];

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
            scrolled ? "py-3" : "py-5"
        )}>
            <div className={cn(
                "max-w-7xl mx-auto rounded-3xl transition-all duration-300",
                scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-premium border border-white/20 px-6" : "px-0"
            )}>
                <div className="flex justify-between items-center h-14">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center gap-10">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <div className="h-5 w-5 border-4 border-white/30 rounded-full border-t-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                ExpenseFlow
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center space-x-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 rounded-xl relative group',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        )}
                                    >
                                        {item.name}
                                        {isActive && (
                                            <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                                        )}
                                        {!isActive && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-slate-300 rounded-full group-hover:w-4 transition-all" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Global Search & User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block w-64">
                            <SearchBar />
                        </div>

                        <div className="flex items-center gap-2">
                            <NotificationBell />

                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                >
                                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-primary/20">
                                        {session?.user?.name ? getInitials(session.user.name) : 'U'}
                                    </div>
                                    <div className="hidden md:block text-left mr-2">
                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
                                            {session?.user?.name?.split(' ')[0] || 'User'}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 leading-none mt-1 uppercase tracking-tighter">
                                            Standard Plan
                                        </p>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                    {session?.user?.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">
                                                    {session?.user?.email}
                                                </p>
                                            </div>

                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                Profile Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors group mt-1"
                                            >
                                                <LogOut className="h-4 w-4 text-rose-400" />
                                                Logout Session
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="flex lg:hidden items-center justify-center h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden mt-4 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
                                        isActive
                                            ? 'bg-primary/5 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
