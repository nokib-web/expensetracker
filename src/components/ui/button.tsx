import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

        const variantStyles = {
            primary: 'bg-[--color-primary] text-white hover:bg-[--color-primary-dark]',
            secondary: 'bg-[--color-secondary] text-white hover:bg-[--color-secondary-dark]',
            success: 'bg-[--color-success] text-white hover:bg-[--color-success-dark]',
            danger: 'bg-[--color-danger] text-white hover:bg-[--color-danger-dark]',
            warning: 'bg-[--color-warning] text-white hover:bg-[--color-warning-dark]',
            outline:
                'border-2 border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary] hover:text-white',
        };

        const sizeStyles = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-10 px-4 py-2',
            lg: 'h-11 px-8 text-lg',
        };

        return (
            <button
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
