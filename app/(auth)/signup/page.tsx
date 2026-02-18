'use client';
import { useState } from 'react';
import { signUp } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
            // Redirect based on role
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
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">Create Account</CardTitle>
                    <p className="text-center text-sm text-slate-500">
                        Sign up to start reporting soil erosion
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-slate-50"
                            />
                        </div>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant={role === 'reporter' ? 'default' : 'outline'}
                                    onClick={() => setRole('reporter')}
                                    className={cn("flex-1", role === 'reporter' ? "bg-green-600 hover:bg-green-700" : "")}
                                >
                                    Reporter
                                </Button>
                                <Button
                                    type="button"
                                    variant={role === 'supervisor' ? 'default' : 'outline'}
                                    onClick={() => setRole('supervisor')}
                                    className={cn("flex-1", role === 'supervisor' ? "bg-blue-600 hover:bg-blue-700" : "")}
                                >
                                    Supervisor
                                </Button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        <Button
                            type="submit"
                            className={cn("w-full", role === 'reporter' ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700")}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-slate-500">
                        <p>Already have an account? <Link href="/signin" className="text-blue-600 font-semibold hover:underline">Sign In</Link></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
