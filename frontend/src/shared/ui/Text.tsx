import React from 'react';
import { cn } from '@shared/lib';

type TextVariant = 
    | 'h1' | 'h2' | 'h3' 
    | 'body' | 'caption' | 'meta' | 'small';

type TextColor = 
    | 'primary' | 'secondary' | 'muted' | 'white' | 'zinc-900' | 'zinc-400';

interface TextProps {
    variant?: TextVariant;
    color?: TextColor;
    className?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    noWrap?: boolean;
    dimmed?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export const Text: React.FC<TextProps> = ({
    variant = 'body',
    color = 'primary',
    className,
    children,
    as,
    noWrap = false,
    dimmed = false,
    onClick,
}) => {
    // Determine the HTML tag
    const Component = as || (
        variant === 'h1' ? 'h1' :
        variant === 'h2' ? 'h2' :
        variant === 'h3' ? 'h3' :
        variant === 'body' ? 'p' :
        'span'
    );

    const variants = {
        h1: 'text-[28px] font-bold tracking-tighter leading-[0.95] font-display',
        h2: 'text-[22px] font-bold tracking-tighter leading-tight font-display',
        h3: 'text-[19px] font-bold tracking-tighter leading-tight font-display',
        body: 'text-[15.5px] font-medium leading-relaxed font-readable',
        caption: 'text-[14.5px] font-medium leading-snug font-readable',
        meta: 'text-[12px] font-semibold font-readable',
        small: 'text-[11px] font-medium font-readable'
    };

    const colors = {
        primary: 'text-[var(--text-primary)]',
        secondary: 'text-[var(--text-secondary)]',
        muted: 'text-[var(--text-muted)]',
        white: 'text-white',
        'zinc-900': 'text-[var(--text-primary)]',
        'zinc-400': 'text-[var(--text-muted)]'
    };

    return (
        <Component 
            className={cn(
                variants[variant],
                colors[color],
                noWrap && 'truncate',
                dimmed && 'opacity-60',
                onClick && 'outline-none',
                className
            )}
            onClick={onClick}
        >
            {children}
        </Component>
    );
};

