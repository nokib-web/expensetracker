export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    userId: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
}

export interface Budget {
    id: string;
    userId: string;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
    startDate: Date;
    endDate?: Date;
}

export interface ZakatRecord {
    id: string;
    userId: string;
    year: number;
    totalWealth: number;
    netWealth: number;
    zakatDue: number;
    zakatPaid: number;
    nisabThreshold: number;
    calculatedAt: Date;
    paidAt?: Date;
}

export interface DashboardStats {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    zakatDue: number;
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
}
