import React from 'react';
import { cn } from '@shared/lib';

interface SkeletonProps {
    className?: string;
    variant?: 'rectangle' | 'circle' | 'text';
}

/**
 * [AIS] Platinum Skeleton v2.0
 * Uses the high-performance 'surgical-shimmer' animation defined in index.css.
 * Zero layout shift, pure premium aesthetics.
 */
const SkeletonLoader: React.FC<SkeletonProps> = ({ 
    className, 
    variant = 'rectangle' 
}) => {
    return (
        <div 
            className={cn(
                "surgical-shimmer bg-[var(--bg-secondary)]/50 relative overflow-hidden",
                variant === 'circle' ? 'rounded-full' : 'rounded-[8px]',
                className
            )}
        />
    );
};

export { SkeletonLoader as Skeleton };
export default SkeletonLoader;
