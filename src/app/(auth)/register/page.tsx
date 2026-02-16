'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterSchema, type RegisterValues } from '@/lib/validations';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<RegisterValues>({
        resolver: zodResolver(RegisterSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: RegisterValues) => {
        setIsLoading(true);

        try {
            await api.post('/api/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            toast.success('Account created! Signing you in...');

            const signInResult = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (signInResult?.error) {
                router.push('/login?registered=true');
            } else if (signInResult?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
            <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden">
                <CardHeader className="space-y-2 bg-white pb-8 pt-10 px-8">
                    <CardTitle className="text-3xl font-black text-center text-slate-900 tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-center font-medium text-slate-500">
                        Join ExpenseFlow and master your wealth
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                                {...register('name')}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                                {...register('password')}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-xs font-bold text-rose-600 ml-1 leading-relaxed">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmPassword" className="text-sm font-bold text-slate-700 ml-1">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 rounded-xl border-slate-200 focus:ring-primary/20"
                                {...register('confirmPassword')}
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] mt-2 shadow-lg shadow-primary/20"
                            disabled={isLoading || !isValid}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
