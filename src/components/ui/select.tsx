import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, children, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        className={cn(
                            'w-full h-12 pl-4 pr-10 rounded-xl border-2 border-border bg-card text-sm font-bold transition-all appearance-none cursor-pointer',
                            'focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            error && 'border-danger focus:ring-danger/10',
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {children}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                {error && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-tight">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
