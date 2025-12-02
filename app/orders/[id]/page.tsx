'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, CheckCircle2, ChefHat, Clock, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function OrderTrackingPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();

        // Real-time subscription for this specific order
        const supabase = createClient();
        const channel = supabase
            .channel(`order-${params.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${params.id}`
                },
                (payload) => {
                    console.log('Order status update:', payload);
                    fetchOrder(); // Refresh full data

                    // Vibrate if status changed to ready
                    if (payload.new.status === 'ready') {
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.id]);

    async function fetchOrder() {
        const supabase = createClient();
        const { data } = await supabase
            .from('orders')
            .select('*, stalls(name, image_url, location)')
            .eq('id', params.id)
            .single();

        if (data) {
            setOrder(data);
        }
        setLoading(false);
    }

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    if (!order) return <div className="min-h-screen bg-background flex items-center justify-center">Order not found</div>;

    const steps = [
        { id: 'received', label: 'Order Sent', icon: <CheckCircle2 className="h-5 w-5" />, time: order.created_at },
        { id: 'preparing', label: 'Preparing', icon: <ChefHat className="h-5 w-5" />, time: null },
        { id: 'ready', label: 'Ready for Pickup', icon: <Clock className="h-5 w-5" />, time: null },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.status);
    // If status is 'completed', show all steps as done
    const isCompleted = order.status === 'completed';
    const activeIndex = isCompleted ? 3 : (currentStepIndex === -1 ? 0 : currentStepIndex);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-border flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-h3 text-secondary">Order #{order.id.slice(0, 4)}</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Stall Info */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        🏪
                    </div>
                    <div>
                        <h2 className="font-bold text-secondary">{order.stalls?.name}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {order.stalls?.location || 'Campus Center'}
                        </p>
                    </div>
                </div>

                {/* Vertical Stepper */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-h3 text-secondary mb-6">Order Status</h3>
                    <div className="relative space-y-8 pl-2">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>

                        {steps.map((step, idx) => {
                            const isActive = idx === activeIndex;
                            const isPast = idx < activeIndex;

                            return (
                                <div key={step.id} className="flex items-start gap-4 relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors z-10 ${isActive || isPast
                                            ? 'bg-primary border-primary/20 text-white'
                                            : 'bg-white border-gray-100 text-gray-300'
                                        }`}>
                                        {step.icon}
                                    </div>
                                    <div className="pt-2">
                                        <h4 className={`font-bold ${isActive || isPast ? 'text-secondary' : 'text-gray-400'}`}>
                                            {step.label}
                                        </h4>
                                        {idx === 0 && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        )}
                                        {isActive && step.id === 'preparing' && (
                                            <p className="text-xs text-primary mt-1 animate-pulse">
                                                Chef is cooking your food...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* OTP Card - Prominent when Ready */}
                {order.status === 'ready' && (
                    <div className="bg-primary text-white p-6 rounded-xl shadow-lg animate-bounce-subtle text-center">
                        <p className="text-sm font-medium opacity-90 mb-2">YOUR ORDER IS READY!</p>
                        <h3 className="text-2xl font-bold mb-4">Show OTP to Vendor</h3>
                        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <span className="text-5xl font-mono font-bold tracking-[0.5em]">{order.otp_code}</span>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <Card className="p-4">
                    <h3 className="font-bold text-secondary mb-3">Order Details</h3>
                    <div className="space-y-2 mb-4">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-600">
                                <span>{item.quantity}x {item.name}</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-secondary">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
