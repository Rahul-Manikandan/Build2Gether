'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Camera, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-50">
            <Link
                href="/dashboard/reporter"
                className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive('/dashboard/reporter') ? "text-primary" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <div className={cn("p-2 rounded-xl", isActive('/dashboard/reporter') && "bg-primary/10")}>
                    <Home className="w-6 h-6" />
                </div>
            </Link>

            <div className="relative -top-8">
                <Link href="/dashboard/reporter/camera">
                    <div className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 border-4 border-white">
                        <Camera className="w-8 h-8" />
                    </div>
                </Link>
            </div>

            <Link
                href="/dashboard/profile"
                className={cn(
                    "flex flex-col items-center gap-1 transition-colors",
                    isActive('/dashboard/profile') ? "text-primary" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <div className={cn("p-2 rounded-xl", isActive('/dashboard/profile') && "bg-primary/10")}>
                    <User className="w-6 h-6" />
                </div>
            </Link>
        </div>
    );
}
