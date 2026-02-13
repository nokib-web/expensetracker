import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, type = 'text', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[--color-foreground] mb-2">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-[--color-danger]' : ''
                        } ${className}`}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-[--color-danger]">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
