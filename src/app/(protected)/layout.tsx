import { Navbar } from '@/components/layout/Navbar';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
                {children}
            </main>
        </div>
    );
}
