import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'secondary';
    className?: string;
}

const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    info: 'bg-blue-50 text-blue-600',
    secondary: 'bg-slate-50 text-slate-500',
    outline: 'border-2 border-slate-100 text-slate-500 bg-transparent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest',
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
