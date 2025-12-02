'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, generateOTP } from '@/lib/utils';
import { initializeRazorpay, createRazorpayOrder } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/client';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    const totalAmount = getTotalAmount();

    async function handlePayment() {
        try {
            setLoading(true);

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('Please login to place an order');
                router.push('/login');
                return;
            }

            // 1. Initialize Razorpay
            const res = await initializeRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load');
                return;
            }

            // 2. Create Order on Server
            const orderData = await createRazorpayOrder(totalAmount);

            // 3. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Foodle',
                description: 'Food Order',
                order_id: orderData.id,
                handler: async function (response: any) {
                    // Payment Success!
                    console.log('Payment successful:', response);
                    await createOrderInDatabase(response.razorpay_payment_id);
                },
                prefill: {
                    name: user.user_metadata.full_name,
                    email: user.email,
                },
                theme: {
                    color: '#FF6B00', // Primary color
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong with payment');
        } finally {
            setLoading(false);
        }
    }

    async function createOrderInDatabase(paymentId: string) {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Group items by stall to create separate orders per stall
            // For MVP, we'll assume single stall ordering or just create multiple orders
            // Let's group by stall_id
            const itemsByStall = items.reduce((acc, item) => {
                if (!acc[item.stall_id]) acc[item.stall_id] = [];
                acc[item.stall_id].push(item);
                return acc;
            }, {} as Record<string, typeof items>);

            const otp = generateOTP();

            // Create an order for each stall
            for (const [stallId, stallItems] of Object.entries(itemsByStall)) {
                const stallTotal = stallItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                const { error } = await (supabase
                    .from('orders')
                    .insert({
                        user_id: user.id,
                        stall_id: stallId,
                        status: 'received',
                        total_amount: stallTotal,
                        payment_status: 'paid',
                        payment_id: paymentId,
                        items: stallItems, // Storing JSON of items
                        special_instructions: specialInstructions,
                        otp_code: otp
                    } as any));

                if (error) throw error;
            }

            // Success!
            clearCart();
            router.push(`/orders?success=true&otp=${otp}`);

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Payment successful but order creation failed. Please contact support.');
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-surface rounded-medium transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-h2 text-secondary">Your Cart</h1>
                </div>

                <div className="flex flex-col items-center justify-center py-20 px-6">
                    <div className="text-[100px] mb-4">🛒</div>
                    <h2 className="text-h2 text-secondary mb-2">Your cart is empty</h2>
                    <p className="text-body text-gray-400 mb-6">Add some delicious food!</p>
                    <Button onClick={() => router.push('/home')}>
                        Browse Stalls
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-surface rounded-medium transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-h2 text-secondary flex-1">Your Cart</h1>
                <button
                    onClick={clearCart}
                    className="text-body-small text-error hover:underline"
                >
                    Clear
                </button>
            </div>

            {/* Cart Items */}
            <div className="px-4 pt-4 space-y-3">
                {items.map((item) => (
                    <Card key={item.menu_item_id} className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <h3 className="text-h3 text-secondary mb-1">{item.name}</h3>
                                <p className="text-body text-secondary-light">
                                    {formatCurrency(item.price)} × {item.quantity}
                                </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-surface border border-border rounded-medium px-2 py-1">
                                    <button
                                        onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center text-body font-medium">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeItem(item.menu_item_id)}
                                    className="p-2 hover:bg-error/10 rounded-medium transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 text-error" />
                                </button>
                            </div>
                        </div>

                        {/* Line Total */}
                        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                            <span className="text-body-small text-gray-400">Line total</span>
                            <span className="text-body font-semibold text-secondary">
                                {formatCurrency(item.price * item.quantity)}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Special Instructions */}
            <div className="px-4 pt-6">
                <details className="bg-white rounded-medium border border-border overflow-hidden">
                    <summary className="px-4 py-3 cursor-pointer text-body font-medium text-secondary flex items-center gap-2">
                        📝 Add cooking instructions (optional)
                    </summary>
                    <div className="px-4 pb-4">
                        <textarea
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            placeholder="e.g., Less spicy, no onions"
                            rows={3}
                            className="w-full bg-surface border border-border rounded-medium px-3 py-2 text-body placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </details>
            </div>

            {/* Bill Details */}
            <div className="px-4 pt-6">
                <Card className="p-4">
                    <h3 className="text-h3 text-secondary mb-4">Bill Details</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between text-body">
                            <span className="text-gray-600">Item Total</span>
                            <span className="text-secondary">{formatCurrency(totalAmount)}</span>
                        </div>

                        <div className="border-t border-dashed border-border my-3"></div>

                        <div className="flex justify-between">
                            <span className="text-h3 text-secondary">To Pay</span>
                            <span className="text-h3 text-secondary">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payment Section */}
            <div className="px-4 pt-6">
                <div className="bg-success/5 border border-success/20 rounded-medium px-4 py-3 mb-4">
                    <p className="text-body text-success flex items-center gap-2">
                        <span>🔒</span>
                        Secure payment via Razorpay
                    </p>
                </div>

                <Button
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    loading={loading}
                >
                    Pay {formatCurrency(totalAmount)} & Place Order
                </Button>
            </div>
        </div>
    );
}
