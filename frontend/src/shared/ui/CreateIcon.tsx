import React from 'react';

interface CreateIconProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const CreateIcon: React.FC<CreateIconProps> = ({ 
    size = 24, 
    strokeWidth = 1.6, 
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
            {/* Arteo Pure Stroke: "The Artisan Pen" (Redesigned for ASP v19.2) */}
            <path 
                d="M7.5 16.5H16.5M14.5 6.5C15.0523 5.94772 15.9477 5.94772 16.5 6.5C17.0523 7.05228 17.0523 7.94772 16.5 8.5L9.5 15.5L6.5 16.5L7.5 13.5L14.5 6.5Z" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

