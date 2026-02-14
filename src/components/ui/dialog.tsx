import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => onOpenChange(false)}
        >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div
                className="relative z-50 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto',
                className
            )}
            role="dialog"
            aria-modal="true"
        >
            {children}
        </div>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    return <div className={cn('mb-4', className)}>{children}</div>;
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    return (
        <h2 className={cn('text-xl font-semibold text-gray-900', className)}>
            {children}
        </h2>
    );
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
    return <p className={cn('text-sm text-gray-600 mt-2', className)}>{children}</p>;
}

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
    return (
        <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
    );
}
