'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '@/components/student/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    async function fetchUser() {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
            setUser(userData);
        }
    }

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-primary to-primary-dark h-48 rounded-b-[32px] px-6 pt-8 pb-6 relative">
                <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center text-[32px]">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full" />
                        ) : (
                            user.name?.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 pt-12 pb-6">
                <h1 className="text-h2 text-secondary">{user.name}</h1>
                <p className="text-body text-gray-400">{user.email}</p>
            </div>

            {/* Stats Cards */}
            <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                <Card className="p-4 text-center">
                    <div className="text-[32px] mb-1">📦</div>
                    <div className="text-h2 text-secondary">0</div>
                    <div className="text-body-small text-gray-400">Total Orders</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-[32px] mb-1">💰</div>
                    <div className="text-h2 text-secondary">₹0</div>
                    <div className="text-body-small text-gray-400">Total Spent</div>
                </Card>
            </div>

            {/* Menu Items */}
            <div className="px-6 space-y-3">
                <Card className="p-4">
                    <button className="w-full flex items-center justify-between" onClick={() => { }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[20px]">📍</span>
                            <span className="text-body text-secondary">Saved Addresses</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </Card>

                <Card className="p-4">
                    <button className="w-full flex items-center justify-between" onClick={() => { }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[20px]">🔔</span>
                            <span className="text-body text-secondary">Notifications</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </Card>

                <Card className="p-4">
                    <button className="w-full flex items-center justify-between" onClick={() => { }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[20px]">❓</span>
                            <span className="text-body text-secondary">Help & Support</span>
                        </div>
                        <span className="text-gray-400">→</span>
                    </button>
                </Card>

                <Card className="p-4 border-error/20">
                    <button className="w-full flex items-center justify-between" onClick={handleLogout}>
                        <div className="flex items-center gap-3">
                            <span className="text-[20px]">🚪</span>
                            <span className="text-body text-error">Log Out</span>
                        </div>
                        <span className="text-error">→</span>
                    </button>
                </Card>
            </div>

            <BottomNav />
        </div>
    );
}
