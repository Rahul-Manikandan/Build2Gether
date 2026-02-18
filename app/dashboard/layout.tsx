'use client';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* pb-24 to prevent content from being hidden behind the fixed bottom nav */}
            {children}
            <BottomNav />
        </div>
    );
}
