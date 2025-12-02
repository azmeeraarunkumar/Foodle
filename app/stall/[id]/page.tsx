'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { Stall, MenuItem } from '@/lib/supabase/database.types';

export default function StallMenuPage() {
    const params = useParams();
    const router = useRouter();
    const stallId = params.id as string;

    const [stall, setStall] = useState<Stall | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const { items: cartItems, addItem, updateQuantity, getTotalItems, getTotalAmount } = useCartStore();

    useEffect(() => {
        fetchStallAndMenu();
    }, [stallId]);

    async function fetchStallAndMenu() {
        const supabase = createClient();

        // Get stall details
        const { data: stallData } = await supabase
            .from('stalls')
            .select('*')
            .eq('id', stallId)
            .single();

        if (stallData) {
            setStall(stallData);
        }

        // Get menu items
        const { data: menuData } = await supabase
            .from('menu_items')
            .select('*')
            .eq('stall_id', stallId)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (menuData) {
            setMenuItems(menuData);
        }

        setLoading(false);
    }

    function getCategories() {
        const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))];
        return categories;
    }

    function getFilteredItems() {
        if (selectedCategory === 'All') {
            return menuItems;
        }
        return menuItems.filter(item => item.category === selectedCategory);
    }

    function getItemQuantity(itemId: string): number {
        const cartItem = cartItems.find(item => item.menu_item_id === itemId);
        return cartItem?.quantity || 0;
    }

    function handleAddToCart(item: MenuItem) {
        addItem({
            menu_item_id: item.id,
            stall_id: stallId,
            name: item.name,
            price: Number(item.price),
        });
    }

    function handleUpdateQuantity(itemId: string, change: number) {
        const currentQty = getItemQuantity(itemId);
        const newQty = currentQty + change;
        updateQuantity(itemId, newQty);
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            </div>
        );
    }

    if (!stall) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-body text-gray-400">Stall not found</p>
            </div>
        );
    }

    const filteredItems = getFilteredItems();
    const categories = getCategories();
    const totalCartItems = getTotalItems();
    const totalCartAmount = getTotalAmount();
    const isSnoozed = stall.is_snoozed;

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
                <h1 className="text-h2 text-secondary flex-1">{stall.name}</h1>
            </div>

            {/* Hero Image */}
            <div className="relative h-44 bg-surface overflow-hidden">
                {stall.image_url ? (
                    <Image
                        src={stall.image_url}
                        alt={stall.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[80px]">
                        🍽️
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Stall Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-h1 text-white mb-2">{stall.name}</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant={stall.is_snoozed ? 'warning' : 'success'}>
                            {stall.is_snoozed ? (stall.snooze_message || 'Busy') : 'Open'}
                        </Badge>
                        <span className="text-body-small text-white">
                            ~{stall.prep_time_mins} min
                        </span>
                    </div>
                </div>
            </div>

            {/* Snoozed Banner */}
            {isSnoozed && (
                <div className="mx-4 mt-4 bg-warning/10 border border-warning/30 rounded-medium px-4 py-3">
                    <p className="text-body text-warning">
                        🟠 This stall is not accepting new orders right now
                    </p>
                </div>
            )}

            {/* Category Pills */}
            <div className="px-4 pt-4 pb-3 overflow-x-auto">
                <div className="flex gap-2">
                    {categories.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`
                  px-4 py-2 rounded-full text-body-small font-medium whitespace-nowrap transition-all
                  ${isActive
                                        ? 'bg-primary text-secondary'
                                        : 'bg-white text-secondary-light border border-border hover:bg-surface'
                                    }
                `}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 space-y-3 pb-6">
                {filteredItems.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    const isUnavailable = !item.is_available || isSnoozed;

                    return (
                        <Card
                            key={item.id}
                            className={`p-3 ${isUnavailable ? 'opacity-40' : ''}`}
                        >
                            <div className="flex gap-3">
                                {/* Item Image */}
                                {item.image_url && (
                                    <div className="relative w-20 h-20 rounded-medium overflow-hidden bg-surface flex-shrink-0">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* Item Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <h3 className="text-h3 text-secondary">
                                                {item.name}
                                                {item.is_special_biryani && ' 🍚'}
                                            </h3>
                                            {item.description && (
                                                <p className="text-body-small text-gray-400 line-clamp-2 mt-1">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            <span className="text-h3 text-secondary">
                                                {formatCurrency(Number(item.price))}
                                            </span>
                                            {item.is_special_biryani && (
                                                <span className="text-caption text-warning ml-2">
                                                    Pre-order only
                                                </span>
                                            )}
                                        </div>

                                        {/* Add to Cart / Quantity Selector */}
                                        {isUnavailable ? (
                                            <Badge variant="error">Out of Stock</Badge>
                                        ) : quantity > 0 ? (
                                            <div className="flex items-center gap-2 bg-primary/10 border border-primary rounded-medium px-1 py-1">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-primary/20 rounded transition-colors"
                                                >
                                                    <Minus className="h-4 w-4 text-primary-dark" />
                                                </button>
                                                <span className="w-6 text-center text-body font-semibold text-secondary">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-primary/20 rounded transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 text-primary-dark" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                className="w-8 h-8 flex items-center justify-center border border-primary rounded-medium hover:bg-primary/10 transition-colors"
                                            >
                                                <Plus className="h-5 w-5 text-primary-dark" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-body text-gray-400">No items in this category</p>
                    </div>
                )}
            </div>

            {/* Sticky Cart Bar */}
            {totalCartItems > 0 && !isSnoozed && (
                <div className="fixed bottom-0 left-0 right-0 bg-secondary px-4 py-3.5 shadow-elevated z-20">
                    <button
                        onClick={() => router.push('/cart')}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-primary rounded-medium hover:bg-primary-dark transition-colors"
                    >
                        <div className="flex items-center gap-2 text-secondary font-semibold">
                            <ShoppingCart className="h-5 w-5" />
                            <span>{totalCartItems} items • {formatCurrency(totalCartAmount)}</span>
                        </div>
                        <span className="text-secondary font-semibold">
                            View Cart →
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
