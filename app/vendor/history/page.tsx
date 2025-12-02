'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function VendorHistoryPage() {
    // Mock data for history
    const historyOrders = [
        { id: '1018', items: '2x Masala Dosa, 1x Coffee', total: 180, status: 'completed', time: 'Today, 2:30 PM' },
        { id: '1017', items: '1x Veg Sandwich', total: 50, status: 'completed', time: 'Today, 1:15 PM' },
        { id: '1016', items: '3x Samosa, 3x Chai', total: 105, status: 'cancelled', time: 'Today, 11:00 AM' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-h2 text-white">Order History</h1>

            <div className="space-y-4">
                {historyOrders.map((order) => (
                    <Card key={order.id} className="bg-gray-900 border-gray-800 p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-lg font-bold text-white">Order #{order.id}</span>
                                <Badge variant={order.status === 'completed' ? 'success' : 'error'}>
                                    {order.status}
                                </Badge>
                            </div>
                            <p className="text-gray-300 text-sm">{order.items}</p>
                            <p className="text-gray-500 text-xs mt-1">{order.time}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-white">₹{order.total}</div>
                            <div className="text-xs text-gray-500">UPI</div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
