import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@shared/lib';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    className,
    label
}) => {
    const sizeMap = {
        sm: { size: 'w-5 h-5', border: 'border-2' },
        md: { size: 'w-10 h-10', border: 'border-[3px]' },
        lg: { size: 'w-10 h-10', border: 'border-[3px]' }, // Forced to md size for Platinum standard
        xl: { size: 'w-10 h-10', border: 'border-[3px]' }  // Forced to md size for Platinum standard
    };

    const current = sizeMap[size];

    return (
        <div className={cn("flex flex-col items-center justify-center gap-6 py-12", className)}>
            <div className={cn("relative flex items-center justify-center", current.size)}>
                {/* Background Ring - Very faint */}
                <div className={cn(
                    "absolute inset-0 rounded-full border-[var(--text-primary)]/[0.03]",
                    current.border
                )} />
                
                {/* Primary Spinner Arc */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full border-transparent border-t-[var(--text-primary)]",
                        current.border
                    )}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1] // Custom cubic-bezier for more premium feel
                    }}
                />

                {/* Secondary Fast Spinner (Outer glow/aura) */}
                <motion.div
                    className={cn(
                        "absolute inset-0 rounded-full border-transparent border-t-[var(--text-primary)]/20 blur-[2px]",
                        current.border
                    )}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Center dot/logo identity */}
                <div className="w-1 h-1 bg-[var(--text-primary)]/20 rounded-full" />
            </div>
            {label && <span className="text-[13px] font-medium text-[var(--text-muted)] animate-pulse">{label}</span>}
        </div>
    );
};

