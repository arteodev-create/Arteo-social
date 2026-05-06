import React from 'react';

interface HomeIconProps {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
    className?: string;
}

export const HomeIcon: React.FC<HomeIconProps> = ({ 
    size = 24, 
    strokeWidth = 1.6, 
    filled = false,
    weight,
    className = "" 
}) => {
    const isFilled = weight === "fill" || filled;
    const finalStrokeWidth = weight === "bold" ? 2.4 : strokeWidth;
    
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            {/* Arteo Flat-Rounded Home: Master Platinum Design with Extra Soft Roof */}
            <path 
                d="M12 5.5C10.5 5.5 9 6.2 8 7.2L3.8 11.4C3.3 11.9 3 12.6 3 13.3V18.5C3 20.4 4.6 22 6.5 22H9.5C10.3 22 11 21.3 11 20.5V16.5C11 15.9 11.4 15.5 12 15.5C12.6 15.5 13 15.9 13 16.5V20.5C13 21.3 13.7 22 14.5 22H17.5C19.4 22 21 20.4 21 18.5V13.3C21 12.6 20.7 11.9 20.2 11.4L16 7.2C15 6.2 13.5 5.5 12 5.5Z" 
                stroke="currentColor" 
                strokeWidth={isFilled ? 0 : finalStrokeWidth} 
                fill={isFilled ? "currentColor" : "none"}
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

