'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignup, setIsSignup] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // Clear any existing session on mount to prevent zombie states
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.signOut().then(() => {
            console.log('🧹 Cleared any existing session');
        });
    }, []);

    async function handleGoogleLogin() {
        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();

            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (signInError) throw signInError;

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in. Please try again.');
            setLoading(false);
        }
    }

    async function handleEmailAuth(e: React.FormEvent) {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (isSignup && !name) {
            setError('Please enter your name');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const supabase = createClient();

            if (isSignup) {
                // Sign up
                console.log('🔵 Starting signup...', { email, name });

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                console.log('🔵 Signup response:', { data, error: signUpError });

                if (signUpError) {
                    console.error('❌ Signup error:', signUpError);
                    throw signUpError;
                }

                if (data.user) {
                    console.log('✅ User created:', data.user.id);

                    // Create user record in database
                    const { error: dbError } = await (supabase
                        .from('users')
                        .insert({
                            id: data.user.id,
                            email: data.user.email!,
                            name: name,
                            role: 'student',
                        } as any));

                    console.log('🔵 Database insert result:', { dbError });

                    if (dbError && dbError.code !== '23505') {
                        console.error('❌ Database error:', dbError);
                        throw new Error(`Database error: ${dbError.message}`);
                    }

                    // Check if email confirmation is required
                    if (data.session) {
                        console.log('✅ Session created! Redirecting to home...');
                        router.push('/home');
                    } else {
                        console.warn('⚠️ No session - email confirmation required');
                        setError('Account created! Please check your email to confirm, or disable email confirmation in Supabase settings for testing.');
                        setLoading(false);
                    }
                }
            } else {
                // Sign in
                console.log('🔵 Signing in...', { email });

                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                console.log('🔵 Signin response:', { data, error: signInError });

                if (signInError) {
                    console.error('❌ Signin error:', signInError);
                    throw signInError;
                }

                if (data.user) {
                    console.log('✅ Signed in! Redirecting...');
                    console.log('User data:', data.user);
                    console.log('Attempting to navigate to /home');

                    // Force navigation
                    window.location.href = '/home';
                }
            }

        } catch (err: any) {
            console.error('❌ Auth error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="mb-4 inline-block">
                        <span className="text-[80px]">🍽️</span>
                    </div>
                    <h1 className="text-h1 text-secondary mb-2">Welcome to Foodle</h1>
                    <p className="text-body text-secondary-light">
                        Order ahead, skip the queue at IITGN food stalls
                    </p>
                </div>

                {/* Google Login Button */}
                <div className="space-y-4">
                    <Button
                        onClick={handleGoogleLogin}
                        loading={loading}
                        className="w-full flex items-center justify-center gap-3"
                        size="lg"
                    >
                        {!loading && (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border"></div>
                        <span className="text-body-small text-gray-400">OR</span>
                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignup && (
                            <Input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                icon={<span>👤</span>}
                                disabled={loading}
                            />
                        )}

                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="h-5 w-5" />}
                            disabled={loading}
                        />

                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock className="h-5 w-5" />}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                        >
                            {isSignup ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Toggle Sign Up / Sign In */}
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError(null);
                            }}
                            className="text-body-small text-primary hover:underline"
                            disabled={loading}
                        >
                            {isSignup
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Sign up"}
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-medium bg-error/10 px-4 py-3 text-body-small text-error border border-error/20">
                            {error}
                        </div>
                    )}

                    <p className="text-caption text-gray-400 text-center">
                        {isSignup ? 'Create an account to start ordering' : 'Sign in to continue'}
                    </p>
                </div>

                {/* Illustration */}
                <div className="text-center pt-8">
                    <div className="text-[120px] opacity-20">
                        🍔🍕🍜
                    </div>
                </div>

                {/* Vendor Link */}
                <div className="text-center pt-4 border-t border-gray-100">
                    <a href="/vendor/login" className="text-xs text-gray-400 hover:text-primary transition-colors">
                        Are you a vendor? Login here
                    </a>
                </div>
            </div>
        </div>
    );
}
