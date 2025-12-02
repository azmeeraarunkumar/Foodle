'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        handleCallback();
    }, []);

    async function handleCallback() {
        const supabase = createClient();


        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;
            if (!session) {
                router.push('/login');
                return;
            }

            const user = session.user;

            // Check if user exists in database
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!existingUser) {
                // Create new user record
                const newUser = {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata.full_name || user.email!.split('@')[0],
                    role: 'student',
                    avatar_url: user.user_metadata.avatar_url,
                };

                const { error: insertError } = await (supabase
                    .from('users')
                    .insert(newUser as any));

                if (insertError) throw insertError;
            }

            // Redirect based on role
            if ((existingUser as any)?.role === 'vendor') {
                router.push('/vendor/dashboard');
            } else {
                router.push('/home');
            }

        } catch (error) {
            console.error('Auth callback error:', error);
            router.push('/login');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-primary">
            <div className="text-center">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-secondary/20 border-t-secondary"></div>
                <p className="mt-4 text-body text-secondary">Signing you in...</p>
            </div>
        </div>
    );
}
