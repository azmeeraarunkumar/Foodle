'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Clock, DollarSign, ShoppingBag, Settings } from 'lucide-react';

export default function VendorDashboard() {
    const [loading, setLoading] = useState(true);
    const [stall, setStall] = useState<any>(null);
    const [orderCap, setOrderCap] = useState(20);
    const [isUpdatingCap, setIsUpdatingCap] = useState(false);
    const [stats, setStats] = useState({
        ordersToday: 0,
        revenueToday: 0,
        pendingOrders: 0
    });

    // Real-time order state
    const [orders, setOrders] = useState<any[]>([]);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize notification sound
        setAudio(new Audio('/sounds/notification.mp3'));
        fetchStallData();
    }, []);

    useEffect(() => {
        if (!stall) return;

        // Fetch initial active orders
        fetchActiveOrders();

        // Subscribe to new orders
        const supabase = createClient();
        const channel = supabase
            .channel('vendor-dashboard')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `stall_id=eq.${stall.id}`
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchActiveOrders(); // Refresh list on any change

                    // Play sound on new order
                    if (payload.eventType === 'INSERT') {
                        audio?.play().catch(e => console.log('Audio play failed', e));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [stall]);

    async function fetchStallData() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch stall associated with this vendor
            const { data: stallData, error } = await supabase
                .from('stalls')
                .select('*')
                .eq('vendor_id', user.id)
                .single();

            if (stallData) {
                setStall(stallData);
                setOrderCap(stallData.order_cap || 20);
            }
        } catch (error) {
            console.error('Error fetching stall:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchActiveOrders() {
        if (!stall) return;
        const supabase = createClient();
        const { data } = await supabase
            .from('orders')
            .select('*, users(name)')
            .eq('stall_id', stall.id)
            .in('status', ['received', 'preparing'])
            .order('created_at', { ascending: true });

        if (data) {
            setOrders(data);
            // Update stats based on orders
            setStats(prev => ({
                ...prev,
                pendingOrders: data.length
            }));
        }
    }

    async function toggleStallStatus(isOpen: boolean) {
        if (!stall) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('stalls')
            .update({ is_open: isOpen })
            .eq('id', stall.id);

        if (!error) {
            setStall({ ...stall, is_open: isOpen });
        }
    }

    async function updateOrderCap() {
        if (!stall) return;
        setIsUpdatingCap(true);

        const supabase = createClient();
        const { error } = await supabase
            .from('stalls')
            .update({ order_cap: orderCap })
            .eq('id', stall.id);

        if (!error) {
            setStall({ ...stall, order_cap: orderCap });
        }
        setIsUpdatingCap(false);
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            // If completed/ready, remove from active list (optional, depending on UX)
            if (newStatus === 'ready') {
                // Maybe keep it in a "Ready for Pickup" section?
                // For now, let's keep it in the list but change UI
            }
        }
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center text-white">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header & Status Toggle */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-h2 text-white">Dashboard</h1>
                    <p className="text-gray-400">Welcome back, {stall?.name || 'Vendor'}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Order Cap Control */}
                    <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
                        <span className="text-sm text-gray-400 pl-2">Max Orders:</span>
                        <Input
                            type="number"
                            value={orderCap}
                            onChange={(e) => setOrderCap(parseInt(e.target.value) || 0)}
                            className="w-20 h-8 bg-gray-800 border-gray-700 text-white text-center"
                        />
                        <Button
                            size="sm"
                            onClick={updateOrderCap}
                            loading={isUpdatingCap}
                            className="h-8"
                        >
                            Set
                        </Button>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center gap-4 bg-gray-900 p-3 rounded-xl border border-gray-800">
                        <span className={`text-sm font-medium ${stall?.is_open ? 'text-green-400' : 'text-red-400'}`}>
                            {stall?.is_open ? '🟢 Open' : '🔴 Closed'}
                        </span>
                        <Switch
                            checked={stall?.is_open}
                            onCheckedChange={toggleStallStatus}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-gray-400 text-sm">Orders Today</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.ordersToday}</div>
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-gray-400 text-sm">Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-white">₹{stats.revenueToday}</div>
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                            <Clock className="h-5 w-5" />
                        </div>
                        <span className="text-gray-400 text-sm">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.pendingOrders}</div>
                </Card>
            </div>

            {/* Active Orders Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Active Orders <Badge variant="default" className="bg-primary text-gray-900">{orders.length}</Badge>
                </h2>

                {orders.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
                        <p>No active orders right now.</p>
                        <p className="text-sm">New orders will appear here instantly.</p>
                    </div>
                )}

                {orders.map((order) => (
                    <Card key={order.id} className="bg-gray-900 border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg font-bold text-white">Order #{order.id.slice(0, 4)}</span>
                                    <Badge variant={order.status === 'preparing' ? 'warning' : 'default'}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {new Date(order.created_at).toLocaleTimeString()} • {order.users?.name || 'Guest'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-primary">₹{order.total_amount}</div>
                                <div className="text-xs text-gray-500">OTP: <span className="font-bold text-white">{order.otp_code}</span></div>
                            </div>
                        </div>

                        <div className="p-4 space-y-2">
                            {/* Parse JSON items */}
                            {Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-gray-300 text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            )) : (
                                <div className="text-red-400 text-sm">Error loading items</div>
                            )}

                            {order.special_instructions && (
                                <div className="mt-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded">
                                    Note: {order.special_instructions}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-900/50 flex gap-3">
                            {order.status === 'received' && (
                                <Button
                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                    Accept & Cook
                                </Button>
                            )}

                            {order.status === 'preparing' && (
                                <Button
                                    onClick={() => updateOrderStatus(order.id, 'ready')}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                                >
                                    Mark Ready
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
