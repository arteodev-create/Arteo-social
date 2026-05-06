import React from 'react';

interface AlgorithmIconProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const AlgorithmIcon: React.FC<AlgorithmIconProps> = ({ 
    size = 24, 
    strokeWidth = 2.5, 
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
            {/* Arteo Bespoke Icon: "The Logic Vertex" (Noir Luxe Edition) */}
            
            {/* Subtle Blueprint Frame (Opacity 10%) */}
            <path 
                d="M4 4H20V20H4V4Z" 
                stroke="currentColor" 
                strokeWidth={1} 
                strokeDasharray="2 2"
                className="opacity-10"
            />
            
            {/* The Processing Path: Right Angle Logic */}
            <path 
                d="M10 8V16H18" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                strokeLinecap="square"
                strokeLinejoin="miter"
            />
            
            {/* The Input: Starting Node */}
            <circle cx="10" cy="8" r="1.5" fill="currentColor" />
            
            {/* THE CORE: Defined Result Square */}
            <rect x="16" y="14" width="4" height="4" fill="currentColor" />
            
            {/* Precision Accent: 1px crosshair detail */}
            <path 
                d="M18 16H20 M18 14V18" 
                stroke="white" 
                strokeWidth={1} 
                className="opacity-50"
            />
        </svg>
    );
};


