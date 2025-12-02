import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, iconPosition = 'left', ...props }, ref) => {
        const baseStyles = 'w-full bg-surface border border-border rounded-medium px-4 py-3.5 text-body text-secondary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all';
        const errorStyles = error ? 'border-error focus:ring-error' : '';

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-body-small font-medium text-secondary-light mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            baseStyles,
                            errorStyles,
                            icon && iconPosition === 'left' && 'pl-12',
                            icon && iconPosition === 'right' && 'pr-12',
                            className
                        )}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-body-small text-error">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
