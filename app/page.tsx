'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SplashScreen() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuthAndRedirect();
    }, []);

    async function checkAuthAndRedirect() {
        const supabase = createClient();

        // Wait minimum 2 seconds for splash effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // Check user role
            const { data: user } = await (supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()) as any;

            if (user?.role === 'vendor') {
                router.push('/vendor/dashboard');
            } else {
                router.push('/home');
            }
        } else {
            router.push('/login');
        }
    }

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-primary">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-4">
                    <span className="text-[80px]">🍽️</span>
                </div>

                {/* Brand Name */}
                <h1 className="mb-2 text-[48px] font-bold text-secondary">
                    Foodle
                </h1>

                {/* Tagline */}
                <p className="text-body text-secondary/90">
                    Skip the line, not the food
                </p>

                {/* Loading Spinner */}
                <div className="mt-20">
                    <div className="h-6 w-6 mx-auto animate-spin rounded-full border-4 border-secondary/20 border-t-secondary"></div>
                </div>
            </div>
        </div>
    );
}
