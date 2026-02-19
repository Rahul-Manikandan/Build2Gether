'use client';
import { useState } from 'react';
import { signIn } from '@/lib/firebase/auth';
import { getUserRole } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userCredential = await signIn(email, password);
            const uid = userCredential.user.uid;
            const role = await getUserRole(uid);

            if (role === 'supervisor') {
                router.push('/dashboard/supervisor');
            } else {
                router.push('/dashboard/reporter');
            }
        } catch (err: any) {
            setError('Failed to sign in. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-40 -left-20 w-60 h-60 bg-secondary rounded-full blur-2xl opacity-40 animate-pulse" />

            <div className="p-6 z-10">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Link>
            </div>

            <main className="flex-1 flex items-center justify-center p-4 z-10">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome Back</h1>
                        <p className="text-primary/90">Sign in to manage your reports</p>
                    </div>

                    <Card className="border-border/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 dark:bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 dark:bg-secondary/50 border-border focus:border-primary focus:ring-primary/20 rounded-xl"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                                <Button size="lg" type="submit" className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-transform active:scale-95" disabled={loading}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-sm text-slate-500">
                        Don't have an account? <Link href="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
