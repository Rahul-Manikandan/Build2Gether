import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-slate-600 hover:text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                    <span className="font-bold text-lg tracking-tight">ErosionReporter</span>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
                <div className="space-y-16">
                    {/* Mission */}
                    <section className="text-center space-y-6">
                        <span className="text-primary font-bold tracking-widest text-sm uppercase bg-primary/10 px-3 py-1 rounded-full">Our Mission</span>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                            Protecting Our Soil, <br /> One Report at a Time.
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Soil erosion is a silent crisis. We empower local communities to monitor, report, and act on environmental changes using real-time data and geolocation technology.
                        </p>
                    </section>

                    {/* Features Grid */}
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-50 rounded-3xl">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🌍</div>
                            <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
                            <p className="text-slate-500"> precise GPS geolocation for every report submitted.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-4">📡</div>
                            <h3 className="text-xl font-bold mb-2">Offline First</h3>
                            <p className="text-slate-500">Works without internet. Data syncs automatically when online.</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-3xl">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🛡️</div>
                            <h3 className="text-xl font-bold mb-2">Community Led</h3>
                            <p className="text-slate-500">Built for citizens, supervisors, and environmental protectors.</p>
                        </div>
                    </section>

                    {/* Credits */}
                    <section className="border-t border-slate-100 pt-16 text-center">
                        <h2 className="text-2xl font-bold mb-8">Open Source Contribution</h2>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="gap-2 h-12 rounded-xl">
                                <Github className="w-5 h-5" />
                                View Source
                            </Button>
                            <Button className="gap-2 h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                                <Globe className="w-5 h-5" />
                                Visit Website
                            </Button>
                        </div>
                        <p className="mt-8 text-slate-400 text-sm">
                            © {new Date().getFullYear()} Build2Gether Team. Licensed under MIT.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
