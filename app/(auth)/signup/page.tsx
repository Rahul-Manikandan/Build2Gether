'use client';
import { useState } from 'react';
import { signUp } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'reporter' | 'supervisor'>('reporter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signUp(email, password, name, role);
            if (role === 'supervisor') {
                router.push('/dashboard/supervisor');
            } else {
                router.push('/dashboard/reporter');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/50 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10" />

            <div className="p-6 z-10">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Link>
            </div>

            <main className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h1>
                        <p className="text-slate-500">Join us to protect our environment</p>
                    </div>

                    <Card className="border-border/50 shadow-xl shadow-slate-200/50">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">I am a...</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRole('reporter')}
                                            className={cn(
                                                "h-12 rounded-xl border-2 font-medium transition-all",
                                                role === 'reporter'
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                            )}
                                        >
                                            Reporter
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('supervisor')}
                                            className={cn(
                                                "h-12 rounded-xl border-2 font-medium transition-all",
                                                role === 'supervisor'
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                            )}
                                        >
                                            Supervisor
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                                <Button size="lg" type="submit" className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-transform active:scale-95" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account? <Link href="/signin" className="text-primary font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
