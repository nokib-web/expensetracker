'use client';

import { Calendar, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { handlePrint } from '@/lib/export';

interface ReportHeaderProps {
    month: number;
    year: number;
    onDateChange: (month: number, year: number) => void;
    onExportCSV: () => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export function ReportHeader({ month, year, onDateChange, onExportCSV }: ReportHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Financial Reports</h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Analyze your spending & savings</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <select
                        value={month}
                        onChange={(e) => onDateChange(parseInt(e.target.value), year)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => onDateChange(month, parseInt(e.target.value))}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 ml-auto md:ml-0">
                    <Button variant="outline" size="sm" onClick={onExportCSV} className="h-10 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 gap-2 font-bold transition-all">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 gap-2 font-bold transition-all">
                        <Printer className="h-4 w-4" />
                        <span className="hidden sm:inline">Print Report</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
