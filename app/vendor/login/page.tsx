'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Store } from 'lucide-react';

export default function VendorLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Clear any existing session on mount
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.signOut();
    }, []);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();

            // Sign in
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            if (data.user) {
                // Verify this user is actually a vendor
                const { data: userRole, error: roleError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (roleError) throw roleError;

                if (userRole?.role !== 'vendor') {
                    throw new Error('Access denied. This portal is for vendors only.');
                }

                console.log('✅ Vendor signed in! Redirecting...');
                window.location.href = '/vendor/dashboard';
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="mb-4 inline-block rounded-full bg-gray-800 p-4">
                        <Store className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-h2 text-white mb-2">Vendor Portal</h1>
                    <p className="text-body text-gray-400">
                        Manage your stall, menu, and orders
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="vendor@foodle.app"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock className="h-5 w-5 text-gray-500" />}
                                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full bg-primary text-gray-900 hover:bg-primary/90 font-bold"
                            size="lg"
                        >
                            Access Dashboard
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Need access? Contact the Foodle admin team.
                </p>
            </div>
        </div>
    );
}
