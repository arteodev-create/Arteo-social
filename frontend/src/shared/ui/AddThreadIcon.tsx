import React from 'react';

interface AddThreadIconProps {
    className?: string;
    size?: number;
    strokeWidth?: number;
}

/**
 * Arteo "Bauhaus" Add Thread Icon (ASP v22.1)
 * A premium, floating plus symbol designed for the high-end boutique social experience.
 * Instead of a standard plus, this features a signature gap in the center,
 * creating a sophisticated "Negative Space" architecture.
 */
export const AddThreadIcon: React.FC<AddThreadIconProps> = ({ 
    className = "w-6 h-6", 
    size = 24, 
    strokeWidth = 1.6 
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
            {/* Horizontal Bar (Left & Right Split) */}
            <path 
                d="M5 12H10.5M13.5 12H19" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                strokeLinecap="round" 
            />
            {/* Vertical Bar (Top & Bottom Split) */}
            <path 
                d="M12 5V10.5M12 13.5V19" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                strokeLinecap="round" 
            />
        </svg>
    );
};

