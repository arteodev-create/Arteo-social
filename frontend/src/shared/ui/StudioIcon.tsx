import React from 'react';

interface StudioIconProps {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    className?: string;
}

export const StudioIcon: React.FC<StudioIconProps> = ({ 
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
            fill={filled ? "currentColor" : "none"} 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            {/* Arteo Pure Stroke: "The Stroke Spark" (Synchronized AI) */}
            <path 
                d="M12 4C12 9.5 14.5 12 20 12C14.5 12 12 14.5 12 20C12 14.5 9.5 12 4 12C9.5 12 12 9.5 12 4Z" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill={filled ? "currentColor" : "none"}
            />
        </svg>
    );
};

