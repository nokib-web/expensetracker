'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Here you would log to a service like Sentry
        console.group('🔴 Application Error Caught');
        console.error('Error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[500px] w-full p-8 text-center bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 animate-in zoom-in duration-300">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full"></div>
                        <div className="relative bg-rose-50 p-8 rounded-full">
                            <AlertCircle className="h-16 w-16 text-rose-600" />
                        </div>
                    </div>

                    <div className="space-y-3 max-w-lg mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Whoops! Something broke.</h2>
                        <p className="text-slate-500 font-bold leading-relaxed">
                            Our financial engines hit a snag. Don't worry, your data is completely safe.
                            We've been notified and are working on a fix!
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left overflow-auto max-h-40">
                                <code className="text-xs text-rose-600 font-mono font-bold block">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button
                            onClick={() => window.location.reload()}
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-rose-200/50 bg-rose-600 hover:bg-rose-700 text-white border-none"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Force Refresh
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 border-2 border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" />
                                Back to Safety
                            </Link>
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
