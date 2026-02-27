import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-12 w-full rounded-xl border-2 border-border bg-card px-4 py-2 text-sm font-bold transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 placeholder:font-medium',
                        'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error && 'border-danger focus:ring-danger/10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-tight">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
