import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    menu_item_id: string;
    stall_id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (menu_item_id: string) => void;
    updateQuantity: (menu_item_id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalAmount: () => number;
    getItemsByStall: (stall_id: string) => CartItem[];
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existingItem = get().items.find((i) => i.menu_item_id === item.menu_item_id);
                set((state) => ({
                    items: existingItem
                        ? state.items.map((i) =>
                            i.menu_item_id === item.menu_item_id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                        : [...state.items, { ...item, quantity: 1 }],
                }));
            },

            removeItem: (menu_item_id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.menu_item_id !== menu_item_id),
                }));
            },

            updateQuantity: (menu_item_id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(menu_item_id);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.menu_item_id === menu_item_id ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalAmount: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getItemsByStall: (stall_id) => {
                return get().items.filter((item) => item.stall_id === stall_id);
            },
        }),
        {
            name: 'foodle-cart-storage',
        }
    )
);
