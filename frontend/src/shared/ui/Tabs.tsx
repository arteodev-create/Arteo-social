import React from 'react';
import { cn } from '@shared/lib';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ElementType;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
    tabClassName?: string;
    activeTabClassName?: string;
    underlineClassName?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    lowercase?: boolean;
}

/**
 * Arteo Tabs Component (ADS v1.5 Platinum)
 * Optimized for performance and silk-smooth motion.
 * Standardizes the "Underline" style across the platform.
 */
export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onChange,
    className,
    tabClassName,
    activeTabClassName,
    underlineClassName,
    size = 'md',
    fullWidth = true,
    lowercase = false,
}) => {
    const sizeMap = {
        sm: 'h-10 text-[12px]',
        md: 'h-12 text-[14px]',
        lg: 'h-14 text-[16px]',
    };

    return (
        <div className={cn(
            'flex overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-primary)]',
            fullWidth ? 'w-full' : 'w-fit',
            className
        )}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'relative flex items-center justify-center group outline-none transition-colors border-r border-[var(--border-primary)] last:border-r-0',
                            fullWidth ? 'flex-1' : 'px-6',
                            sizeMap[size],
                            isActive ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]',
                            tabClassName
                        )}
                    >
                        <div className={cn(
                            'flex items-center gap-2 font-bold relative z-10 leading-none',
                            lowercase ? 'lowercase' : '',
                            isActive ? 'text-[var(--bg-primary)]' : 'text-zinc-500',
                            activeTabClassName && isActive ? activeTabClassName : ''
                        )}>
                            {Icon && <Icon className={isActive ? 'w-4 h-4' : 'w-4 h-4 opacity-50'} strokeWidth={isActive ? 2.5 : 2} />}
                            <span className="tracking-tight">{tab.label}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
