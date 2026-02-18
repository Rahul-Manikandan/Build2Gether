'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Report } from '@/lib/types';
import ReportCard from '@/components/dashboard/ReportCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming cn utility is available or imported correctly if inside button/etc
// Actually we need to make sure we import icons
import { LogOut, Filter, RefreshCw } from 'lucide-react';

export default function SupervisorDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
    const router = useRouter();

    useEffect(() => {
        // Subscribe to real-time updates
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Supervisor Dashboard</h1>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500 hidden md:block">
                        {reports.length} Total Reports
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-600 hover:text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Submitted Reports</h2>
                        <p className="text-slate-500">Manage and track erosion reports from the field.</p>
                    </div>

                    <div className="flex items-center bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                        <Button
                            variant={filterStatus === 'all' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('all')}
                            className="text-xs"
                        >All</Button>
                        <Button
                            variant={filterStatus === 'pending' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('pending')}
                            className="text-xs"
                        >Pending</Button>
                        <Button
                            variant={filterStatus === 'reviewed' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('reviewed')}
                            className="text-xs"
                        >Reviewed</Button>
                        <Button
                            variant={filterStatus === 'resolved' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('resolved')}
                            className="text-xs"
                        >Resolved</Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {filteredReports.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                                <p className="text-slate-500">No reports found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredReports.map(report => (
                                    <ReportCard key={report.id} report={report} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
