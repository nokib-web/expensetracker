'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    isSystem: boolean;
    _count?: {
        transactions: number;
    };
}

interface GroupedCategories {
    INCOME: Category[];
    EXPENSE: Category[];
}

export default function CategoriesPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: categories, isLoading } = useQuery<GroupedCategories>({
        queryKey: ['categories', 'grouped', 'includeCount'],
        queryFn: async () => {
            const response = await fetch('/api/categories?includeCount=true');
            if (!response.ok) throw new Error('Failed to fetch categories');
            return response.json();
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: { name: string; type?: string; id?: string }) => {
            const url = data.id ? `/api/categories/${data.id}` : '/api/categories';
            const method = data.id ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save category');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
            setIsFormOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.message);
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to delete category');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Because of reassignment
            toast.success('Category deleted and transactions reassigned to Uncategorized');
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const resetForm = () => {
        setName('');
        setEditingCategory(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setFormType(category.type);
        setIsFormOpen(true);
    };

    const handleAdd = (type: 'INCOME' | 'EXPENSE') => {
        setFormType(type);
        resetForm();
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        mutation.mutate({
            name,
            type: editingCategory ? undefined : formType,
            id: editingCategory?.id,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure? If this category has transactions, they will be moved to "Uncategorized".')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                    <p className="text-gray-600">Organize your finances with custom categories</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Categories */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Income Categories
                        </CardTitle>
                        <Button size="sm" variant="success" onClick={() => handleAdd('INCOME')}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-100">
                            {categories?.INCOME.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Expense Categories */}
                <Card className="border-t-4 border-t-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            Expense Categories
                        </CardTitle>
                        <Button size="sm" variant="danger" onClick={() => handleAdd('EXPENSE')}>
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-100">
                            {categories?.EXPENSE.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : `Add ${formType === 'INCOME' ? 'Income' : 'Expense'} Category`}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input
                            label="Category Name"
                            placeholder="e.g. Travel, Bonus"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
                            {isSubmitting ? <LoadingSpinner size="sm" /> : editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CategoryItem({ category, onEdit, onDelete }: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <li className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors px-2 rounded-md">
            <div className="flex flex-col">
                <span className="font-medium text-gray-900 flex items-center gap-2">
                    {category.name}
                    {category.isSystem && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1 border-gray-200 text-gray-400">System</Badge>
                    )}
                </span>
                <span className="text-sm text-gray-500">
                    {category._count?.transactions || 0} transactions
                </span>
            </div>
            {!category.isSystem && (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                        <Edit2 className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </Button>
                </div>
            )}
        </li>
    );
}
