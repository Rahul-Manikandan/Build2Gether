'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ReporterDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(20));

                    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                        setRecentReports(reports);

                        // Calc stats
                        setStats({
                            total: reports.length,
                            pending: reports.filter((r: any) => r.status === 'pending').length,
                            approved: reports.filter((r: any) => r.status === 'approved').length
                        });

                        // Filter for resolved/approved notifications
                        const resolved = reports.filter((r: any) => r.status === 'resolved' || r.status === 'approved');
                        setNotifications(resolved);

                        setLoading(false);
                    }, (error) => {
                        console.error("Snapshot error:", error);
                        setLoading(false);
                    });
                    return () => unsubscribeSnapshot();
                } catch (e) {
                    console.error("Query setup error:", e);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const filteredReports = recentReports.filter(report =>
        report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'resolved': return 'bg-blue-100 text-blue-700';
            default: return 'bg-orange-100 text-orange-700';
        }
    };

    return (
        <div className="p-6 space-y-8 font-sans relative">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hi {user?.displayName ? user.displayName.split(' ')[0] : 'Reporter'}</h1>
                    <p className="text-slate-500 text-sm">Welcome back!</p>
                </div>

                {/* Notification Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative cursor-pointer">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                            </div>
                            {notifications.some(n => n.status === 'resolved') && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-100">
                        <DropdownMenuLabel className="p-4 border-b border-slate-50">Notifications</DropdownMenuLabel>
                        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                            {notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <DropdownMenuItem key={note.id} className="p-3 rounded-lg flex items-start gap-3 cursor-default focus:bg-slate-50">
                                        <div className={`mt-1 w-2 h-2 rounded-full ${getStatusColor(note.status).split(' ')[0].replace('bg-', 'bg-')}`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">Report Updated</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                Your report "{note.description}" is marked as <span className="font-bold">{note.status}</span>.
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(note.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No notifications yet.
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports..."
                    className="pl-10 h-12 bg-white text-slate-900 placeholder:text-slate-400 border-none shadow-sm rounded-xl focus-visible:ring-primary"
                />
            </div>

            {/* Stats Overview */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Monthly Review</h2>
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span className="text-xs font-bold">📅</span>
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1 bg-primary text-white p-5 rounded-3xl shadow-lg shadow-primary/20 flex flex-col justify-between h-40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
                        <span className="text-primary-foreground/80 font-medium">Total Reports</span>
                        <div className="text-4xl font-bold">{stats.total}</div>
                        <div className="text-sm opacity-80">This Month</div>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center h-[calc(50%-0.5rem)]">
                            <span className="text-slate-500 text-xs font-medium">Pending</span>
                            <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center h-[calc(50%-0.5rem)]">
                            <span className="text-slate-500 text-xs font-medium">Approved</span>
                            <div className="text-2xl font-bold text-slate-900">{stats.approved}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reports List */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                </div>

                <div className="space-y-4 pb-20">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                            <Card key={report.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                                        {report.imageUrl ? (
                                            <img src={report.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <span className="text-xs">No Img</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{report.description}</h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(report.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p>No reports found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
