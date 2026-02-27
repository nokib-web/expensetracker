import * as React from 'react';
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';

        const variantStyles = {
            primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 focus:ring-primary/20',
            secondary: 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:brightness-110 focus:ring-secondary/20',
            success: 'bg-success text-success-foreground shadow-lg shadow-success/20 hover:brightness-110 focus:ring-success/20',
            danger: 'bg-danger text-danger-foreground shadow-lg shadow-danger/20 hover:brightness-110 focus:ring-danger/20',
            warning: 'bg-warning text-warning-foreground shadow-lg shadow-warning/20 hover:brightness-110 focus:ring-warning/20',
            outline: 'border-2 border-border bg-transparent hover:bg-slate-50 text-foreground',
            ghost: 'bg-transparent hover:bg-slate-50 text-foreground',
        };

        const sizeStyles = {
            sm: 'h-9 px-4 text-xs tracking-wider uppercase',
            md: 'h-11 px-6 text-sm',
            lg: 'h-12 px-8 text-base',
            icon: 'h-11 w-11 p-0',
        };

        return (
            <button
                className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
