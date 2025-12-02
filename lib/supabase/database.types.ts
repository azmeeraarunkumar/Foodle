export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    role: 'student' | 'vendor'
                    avatar_url: string | null
                    phone: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    role: 'student' | 'vendor'
                    avatar_url?: string | null
                    phone?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    role?: 'student' | 'vendor'
                    avatar_url?: string | null
                    phone?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            stalls: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    image_url: string | null
                    vendor_id: string | null
                    is_open: boolean
                    is_snoozed: boolean
                    snooze_message: string | null
                    opening_time: string | null
                    closing_time: string | null
                    prep_time_mins: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    image_url?: string | null
                    vendor_id?: string | null
                    is_open?: boolean
                    is_snoozed?: boolean
                    snooze_message?: string | null
                    opening_time?: string | null
                    closing_time?: string | null
                    prep_time_mins?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    image_url?: string | null
                    vendor_id?: string | null
                    is_open?: boolean
                    is_snoozed?: boolean
                    snooze_message?: string | null
                    opening_time?: string | null
                    closing_time?: string | null
                    prep_time_mins?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            menu_items: {
                Row: {
                    id: string
                    stall_id: string
                    name: string
                    description: string | null
                    price: number
                    image_url: string | null
                    category: 'Snacks' | 'Drinks' | 'Meals' | 'Desserts' | 'Other' | null
                    is_available: boolean
                    is_special_biryani: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    stall_id: string
                    name: string
                    description?: string | null
                    price: number
                    image_url?: string | null
                    category?: 'Snacks' | 'Drinks' | 'Meals' | 'Desserts' | 'Other' | null
                    is_available?: boolean
                    is_special_biryani?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    stall_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    category?: 'Snacks' | 'Drinks' | 'Meals' | 'Desserts' | 'Other' | null
                    is_available?: boolean
                    is_special_biryani?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    stall_id: string
                    items: Json
                    special_instructions: string | null
                    total_amount: number
                    status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
                    otp_code: string
                    payment_status: 'pending' | 'paid' | 'refunded'
                    razorpay_order_id: string | null
                    razorpay_payment_id: string | null
                    created_at: string
                    accepted_at: string | null
                    ready_at: string | null
                    completed_at: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    stall_id: string
                    items: Json
                    special_instructions?: string | null
                    total_amount: number
                    status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
                    otp_code: string
                    payment_status?: 'pending' | 'paid' | 'refunded'
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    created_at?: string
                    accepted_at?: string | null
                    ready_at?: string | null
                    completed_at?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    stall_id?: string
                    items?: Json
                    special_instructions?: string | null
                    total_amount?: number
                    status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled'
                    otp_code?: string
                    payment_status?: 'pending' | 'paid' | 'refunded'
                    razorpay_order_id?: string | null
                    razorpay_payment_id?: string | null
                    created_at?: string
                    accepted_at?: string | null
                    ready_at?: string | null
                    completed_at?: string | null
                    updated_at?: string
                }
            }
        }
    }
}

export type User = Database['public']['Tables']['users']['Row'];
export type Stall = Database['public']['Tables']['stalls']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];

export type OrderItem = {
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
};
