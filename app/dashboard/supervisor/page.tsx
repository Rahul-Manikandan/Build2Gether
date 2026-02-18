'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Report } from '@/lib/types';
import ReportCard from '@/components/dashboard/ReportCard';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, List as ListIcon, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SupervisorDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Report[];
            setReports(reportsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/signin');
    };

    const filteredReports = reports.filter(report => {
        if (filterStatus === 'all') return true;
        return report.status === filterStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Supervisor</h1>
                        <span className="text-xs text-slate-500">Admin Dashboard</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </header>

            <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
                        <p className="text-slate-500 mt-1">
                            You have <span className="font-bold text-primary">{reports.filter(r => r.status === 'pending').length}</span> pending reports to review.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Status Filter */}
                        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto">
                            {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap",
                                        filterStatus === status
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="hidden md:flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2 rounded-lg transition-colors", viewMode === 'grid' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600")}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No reports found</h3>
                        <p className="text-slate-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className={cn(
                        "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                    )}>
                        {filteredReports.map(report => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
