'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function VendorMenuPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchMenuItems();
    }, []);

    async function fetchMenuItems() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Get vendor's stall first
            const { data: stall } = await supabase
                .from('stalls')
                .select('id')
                .eq('vendor_id', user.id)
                .single();

            if (stall) {
                // Get menu items
                const { data: menuItems } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('stall_id', stall.id)
                    .order('category');

                if (menuItems) {
                    setItems(menuItems);
                    // Extract unique categories
                    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)));
                    setCategories(['All', ...uniqueCategories]);
                }
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleAvailability(itemId: string, currentStatus: boolean) {
        const supabase = createClient();
        const { error } = await (supabase
            .from('menu_items')
            .update({ is_available: !currentStatus } as any)
            .eq('id', itemId));

        if (!error) {
            setItems(items.map(item =>
                item.id === itemId ? { ...item, is_available: !currentStatus } : item
            ));
        }
    }

    const filteredItems = selectedCategory === 'All'
        ? items
        : items.filter(item => item.category === selectedCategory);

    if (loading) return <div className="text-white text-center mt-10">Loading menu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-h2 text-white">Menu Management</h1>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Item
                </Button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                            ? 'bg-primary text-gray-900'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="bg-gray-900 border-gray-800 p-4 flex gap-4">
                        {/* Image Placeholder */}
                        <div className="h-24 w-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-gray-600" />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white">{item.name}</h3>
                                    <span className="text-primary font-bold">₹{item.price}</span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={item.is_available}
                                        onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                                    />
                                    <span className={`text-xs ${item.is_available ? 'text-green-400' : 'text-gray-500'}`}>
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
