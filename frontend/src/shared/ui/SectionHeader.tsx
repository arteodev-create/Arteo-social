import React from 'react';
import { Text } from '@shared/ui';
import { cn } from '@shared/lib';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

/**
 * Section title component for content areas such as Search, Home, and Explore.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    actionLabel,
    onAction,
    className
}) => {
    return (
        <div className={cn("px-6 mt-10 mb-8 flex items-end justify-between", className)}>
            <div className="flex flex-col gap-1.5">
                <Text variant="h2" className="text-black">
                    {title}
                </Text>
                {subtitle && (
                    <Text variant="caption" color="muted" className="font-medium">
                        {subtitle}
                    </Text>
                )}
            </div>
            
            {actionLabel && onAction && (
                <button 
                    onClick={onAction}
                    className="text-[13px] font-bold text-zinc-400 hover:text-black transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
