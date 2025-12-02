'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from '@/components/student/BottomNav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle2, ChevronRight, Receipt } from 'lucide-react';

export default function OrdersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newOrderOtp, setNewOrderOtp] = useState('');

    useEffect(() => {
        // Check for success params
        if (searchParams.get('success') === 'true') {
            setShowSuccessModal(true);
            setNewOrderOtp(searchParams.get('otp') || '');
            // Clean up URL
            router.replace('/orders');
        }

        fetchOrders();

        // Real-time subscription
        const supabase = createClient();
        const channel = supabase
            .channel('student-orders')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Order update:', payload);
                    // Refresh orders on any update
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchOrders() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
            .from('orders')
            .select('*, stalls(name, image_url)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            setOrders(data);
        }
        setLoading(false);
    }

    const activeOrders = orders.filter(o => ['received', 'preparing', 'ready'].includes(o.status));
    const historyOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-white px-6 pt-8 pb-4 sticky top-0 z-10 shadow-sm">
                <h1 className="text-h2 text-secondary mb-4">My Orders</h1>

                {/* Tabs */}
                <div className="flex p-1 bg-surface rounded-xl">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'active'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'history'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading orders...</div>
                ) : displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-[60px] mb-4 opacity-50">
                            {activeTab === 'active' ? '🍳' : '📜'}
                        </div>
                        <h3 className="text-h3 text-secondary mb-2">
                            {activeTab === 'active' ? 'No active orders' : 'No past orders'}
                        </h3>
                        <p className="text-body text-gray-400 mb-6">
                            {activeTab === 'active'
                                ? "Hungry? Go find something delicious!"
                                : "Your order history will show up here."}
                        </p>
                        {activeTab === 'active' && (
                            <Button onClick={() => router.push('/home')}>
                                Browse Stalls
                            </Button>
                        )}
                    </div>
                ) : (
                    displayedOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                            🏪
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-secondary">{order.stalls?.name}</h3>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        order.status === 'ready' ? 'success' :
                                            order.status === 'preparing' ? 'warning' :
                                                'default'
                                    }>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="space-y-1 mb-4">
                                    {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-600">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-border">
                                    <div className="font-bold text-secondary">
                                        Total: {formatCurrency(order.total_amount)}
                                    </div>

                                    {activeTab === 'active' && (
                                        <Button
                                            size="sm"
                                            variant={order.status === 'ready' ? 'primary' : 'secondary'}
                                            onClick={() => router.push(`/orders/${order.id}`)}
                                        >
                                            {order.status === 'ready' ? 'Collect Order' : 'Track Status'}
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* OTP Bar for Active Orders */}
                            {activeTab === 'active' && (
                                <div className="bg-primary/5 px-4 py-2 flex justify-between items-center border-t border-primary/10">
                                    <span className="text-xs font-medium text-primary">Show to Vendor</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">OTP:</span>
                                        <span className="text-lg font-bold text-primary tracking-widest">{order.otp_code}</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl scale-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-h2 text-secondary mb-2">Order Placed!</h2>
                        <p className="text-body text-gray-500 mb-6">
                            Your order has been sent to the vendor.
                        </p>

                        <div className="bg-surface rounded-xl p-4 mb-6 border border-border border-dashed">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your Pickup OTP</p>
                            <div className="text-4xl font-bold text-primary tracking-[0.5em] font-mono">
                                {newOrderOtp}
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Track Order
                        </Button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
