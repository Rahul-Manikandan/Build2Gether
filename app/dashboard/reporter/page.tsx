'use client';
import ReportForm from '@/components/forms/ReportForm';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

export default function ReporterDashboard() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/signin');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Erosion Reporter</h1>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                </Button>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">New Report</h2>
                        <p className="text-slate-500">Submit a new soil erosion incident report with photo evidence and location.</p>
                    </div>
                    <ReportForm />
                </div>
            </main>
        </div>
    );
}
