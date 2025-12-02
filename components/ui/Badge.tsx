import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'default';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center rounded-small px-2 py-1 text-caption font-medium';

        const variants = {
            success: 'bg-success/10 text-success',
            warning: 'bg-warning/10 text-warning',
            error: 'bg-error/10 text-error',
            default: 'bg-gray-100 text-gray-600',
        };

        return (
            <span
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
