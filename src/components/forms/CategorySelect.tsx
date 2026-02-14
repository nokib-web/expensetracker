'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
}

interface CategorySelectProps {
    type: 'INCOME' | 'EXPENSE';
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    disabled?: boolean;
}

export function CategorySelect({
    type,
    value,
    onChange,
    error,
    label,
    disabled
}: CategorySelectProps) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categories = [], isLoading } = useQuery<Category[]>({
        queryKey: ['categories', type],
        queryFn: async () => {
            const response = await fetch(`/api/categories?type=${type}`);
            if (!response.ok) throw new Error('Failed to fetch categories');
            return response.json();
        },
    });

    const addCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create category');
            }
            return response.json();
        },
        onSuccess: (newCat) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category added');
            onChange(newCat.id);
            setIsAdding(false);
            setNewCategoryName('');
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'ADD_NEW') {
            setIsAdding(true);
        } else {
            onChange(val);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsSubmitting(true);
        addCategoryMutation.mutate(newCategoryName);
    };

    return (
        <>
            <div className="space-y-2">
                <Select
                    label={label}
                    value={value}
                    onChange={handleSelectChange}
                    error={error}
                    disabled={disabled || isLoading}
                >
                    <option value="">Select a category</option>
                    {isLoading ? (
                        <option disabled>Loading categories...</option>
                    ) : (
                        categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))
                    )}
                    <option value="ADD_NEW" className="font-bold text-blue-600">
                        + Add new category
                    </option>
                </Select>
            </div>

            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New {type === 'INCOME' ? 'Income' : 'Expense'} Category</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            label="Category Name"
                            placeholder="e.g. Travel, Bonus"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCategory();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCategory} disabled={isSubmitting || !newCategoryName.trim()}>
                            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
