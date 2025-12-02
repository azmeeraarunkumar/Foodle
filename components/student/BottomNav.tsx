'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { icon: Home, label: 'Home', href: '/home' },
    { icon: ClipboardList, label: 'Orders', href: '/orders' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Users, label: 'About', href: '/about' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-bottom-nav">
            <div className="flex items-center justify-around h-16 px-4">
                {navItems.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors relative min-w-[64px]',
                                isActive ? 'text-primary' : 'text-gray-400'
                            )}
                        >
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-primary rounded-full" />
                            )}
                            <Icon className={cn('h-6 w-6', isActive && 'scale-110')} />
                            <span className={cn('text-caption', isActive && 'font-semibold')}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
