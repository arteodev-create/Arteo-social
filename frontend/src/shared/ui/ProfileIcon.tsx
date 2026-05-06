import React from 'react';

interface ProfileIconProps {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    className?: string;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({ 
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
            {/* Arteo Pure Stroke: "The Stroke Persona" (Synchronized Profile - ASP v18.1) */}
            <circle 
                cx="12" 
                cy="8" 
                r="3.5" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                fill={filled ? "currentColor" : "none"}
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            <path 
                d="M5 21C5 18 8 15.5 12 15.5C16 15.5 19 18 19 21" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                fill={filled ? "currentColor" : "none"}
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

