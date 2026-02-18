import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">

      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-secondary/30 to-background rounded-b-[3rem] -z-10" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-10 w-40 h-40 bg-secondary rounded-full blur-2xl opacity-50" />

      {/* Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">

        {/* Hero Section */}
        <div className="max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

          {/* Logo / Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Manage your <br />
            <span className="text-primary">Erosion Reports</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-sm mx-auto">
            Empowering communities to monitor soil health with real-time geolocation and offline support.
          </p>

          <div className="pt-8">
            <Link href="/signin">
              <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-105 active:scale-95">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex justify-center gap-4 text-sm text-slate-400">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <span>•</span>
            <Link href="/dashboard/supervisor" className="hover:text-primary transition-colors">Admin Login</Link>
          </div>

        </div>
      </main>

      {/* Decorative Bottom Pattern (Optional for style) */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
