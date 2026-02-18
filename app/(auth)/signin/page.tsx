'use client';
import { useState } from 'react';
import { signIn } from '@/lib/firebase/auth';
import { getUserRole } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

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
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">Sign In</CardTitle>
                    <p className="text-center text-sm text-slate-500">
                        Enter your email and password to access your account
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-50"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>Don't have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign Up</Link></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
