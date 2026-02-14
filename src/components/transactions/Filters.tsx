'use client';

import { Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
}

interface FiltersProps {
    filters: {
        type: string;
        categoryId: string;
        startDate: string;
        endDate: string;
        search: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
}

export function Filters({ filters, onFilterChange, onReset }: FiltersProps) {
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            return response.json();
        },
    });

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search description..."
                            className="pl-9"
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                        />
                    </div>

                    <Select
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </Select>

                    <Select
                        value={filters.categoryId}
                        onChange={(e) => onFilterChange('categoryId', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories
                            .filter((c) => !filters.type || c.type === filters.type)
                            .map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.type.toLowerCase()})
                                </option>
                            ))}
                    </Select>

                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFilterChange('startDate', e.target.value)}
                        placeholder="Start Date"
                    />

                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFilterChange('endDate', e.target.value)}
                        placeholder="End Date"
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500">
                        <X className="h-4 w-4 mr-2" />
                        Reset Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
