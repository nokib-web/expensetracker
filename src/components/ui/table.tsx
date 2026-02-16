import * as React from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export function Table({ children, className }: TableProps) {
    return (
        <div className="w-full overflow-auto">
            <table className={cn('w-full caption-bottom text-sm', className)}>
                {children}
            </table>
        </div>
    );
}

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
    return <thead className={cn('border-b', className)}>{children}</thead>;
}

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
    return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    children: React.ReactNode;
    className?: string;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
    return (
        <tr
            className={cn(
                'border-b transition-colors hover:bg-gray-50',
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
    return (
        <th
            className={cn(
                'h-12 px-4 text-left align-middle font-medium text-gray-700',
                className
            )}
        >
            {children}
        </th>
    );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
    className?: string;
}

export function TableCell({ children, className, ...props }: TableCellProps) {
    return (
        <td className={cn('p-4 align-middle', className)} {...props}>
            {children}
        </td>
    );
}
