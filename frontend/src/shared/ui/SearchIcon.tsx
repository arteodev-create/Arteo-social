import React from 'react';

interface SearchIconProps {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    className?: string;
}

export const SearchIcon: React.FC<SearchIconProps> = ({ 
    size = 24, 
    strokeWidth = 1.6, 
    filled = false,
    className = "" 
}) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            {/* Arteo Pure Stroke: "The Stroke Lens" (Synchronized Search) */}
            <circle 
                cx="11" 
                cy="11" 
                r="7" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                fill={filled ? "currentColor" : "none"}
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            <path 
                d="M20 20L16.5 16.5" 
                stroke="currentColor" 
                strokeWidth={filled ? strokeWidth + 0.5 : strokeWidth} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

