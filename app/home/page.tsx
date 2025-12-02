'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '@/components/student/BottomNav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Stall } from '@/lib/supabase/database.types';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUserAndStalls();
        subscribeToStallUpdates();
    }, []);

    async function fetchUserAndStalls() {
        const supabase = createClient();

        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
            setUser(userData);
        }

        // Get all stalls
        const { data: stallsData } = await supabase
            .from('stalls')
            .select('*')
            .order('name', { ascending: true });

        if (stallsData) {
            setStalls(stallsData);
        }

        setLoading(false);
    }

    function subscribeToStallUpdates() {
        const supabase = createClient();

        const channel = supabase
            .channel('stall-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'stalls',
                },
                (payload) => {
                    console.log('Stall updated:', payload);
                    fetchUserAndStalls();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    function getStallStatus(stall: Stall) {
        if (!stall.is_open) {
            return { variant: 'error' as const, text: 'Closed', canOrder: false };
        }
        if (stall.is_snoozed) {
            return {
                variant: 'warning' as const,
                text: stall.snooze_message || 'Busy - Back Soon',
                canOrder: false
            };
        }
        return { variant: 'success' as const, text: 'Open', canOrder: true };
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            </div>
        );
    }

    const firstName = user?.name?.split(' ')[0] || 'Student';

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-white px-6 pt-8 pb-6">
                <h2 className="text-h2 text-secondary mb-1">
                    Hey, {firstName} 👋
                </h2>
                <p className="text-body text-secondary-light">What are you craving?</p>

                {/* Search Bar */}
                <div className="relative mt-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-medium text-body placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Stalls List */}
            <div className="px-4 pt-6">
                <p className="text-caption text-gray-400 mb-4 px-2">FOOD STALLS</p>

                <div className="space-y-3">
                    {stalls.map((stall) => {
                        const status = getStallStatus(stall);

                        return (
                            <Card
                                key={stall.id}
                                className={`p-3 cursor-pointer transition-all hover:shadow-elevated ${!status.canOrder ? 'opacity-70' : ''
                                    }`}
                                onClick={() => router.push(`/stall/${stall.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Stall Image */}
                                    <div className="relative w-20 h-20 rounded-medium overflow-hidden bg-surface flex-shrink-0">
                                        {stall.image_url ? (
                                            <Image
                                                src={stall.image_url}
                                                alt={stall.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[32px]">
                                                🍽️
                                            </div>
                                        )}
                                    </div>

                                    {/* Stall Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-h3 text-secondary mb-1">
                                            {stall.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={status.variant}>
                                                {status.text}
                                            </Badge>
                                            {status.canOrder && (
                                                <span className="text-body-small text-gray-500">
                                                    ~{stall.prep_time_mins} min
                                                </span>
                                            )}
                                        </div>
                                        {stall.description && (
                                            <p className="text-body-small text-gray-400 line-clamp-1">
                                                {stall.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-gray-300">
                                        →
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {stalls.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-body text-gray-400">No stalls available</p>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
