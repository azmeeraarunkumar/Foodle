'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, History, LogOut, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function VendorNav() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/vendor/login');
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 pb-safe md:relative md:border-t-0 md:border-r md:h-screen md:w-64 md:flex-col md:justify-between md:p-4">
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center gap-3 px-4 py-4 mb-6">
                <div className="rounded-full bg-primary/20 p-2">
                    <Store className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold text-white">Vendor Portal</span>
            </div>

            {/* Navigation Items */}
            <div className="flex justify-around items-center h-16 md:h-auto md:flex-col md:space-y-2 md:items-stretch">
                <Link
                    href="/vendor/dashboard"
                    className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-colors ${isActive('/vendor/dashboard')
                            ? 'text-primary md:bg-gray-800'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                >
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Dashboard</span>
                </Link>

                <Link
                    href="/vendor/menu"
                    className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-colors ${isActive('/vendor/menu')
                            ? 'text-primary md:bg-gray-800'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                >
                    <UtensilsCrossed className="h-6 w-6" />
                    <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Menu</span>
                </Link>

                <Link
                    href="/vendor/history"
                    className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-lg transition-colors ${isActive('/vendor/history')
                            ? 'text-primary md:bg-gray-800'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                >
                    <History className="h-6 w-6" />
                    <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">History</span>
                </Link>

                {/* Mobile Logout (Hidden) / Desktop Logout (Visible) */}
                <button
                    onClick={handleLogout}
                    className="hidden md:flex w-full items-center gap-3 p-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </nav>
    );
}
