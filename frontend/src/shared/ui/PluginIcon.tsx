import React from 'react';

interface PluginIconProps {
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const PluginIcon: React.FC<PluginIconProps> = ({ 
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
            {/* Arteo Plugin Bespoke Icon: "The Modular Link" (Noir Luxe Edition) */}
            
            {/* Core System: Minimalist Square Frame */}
            <rect 
                x="4" 
                y="4" 
                width="10" 
                height="10" 
                stroke="currentColor" 
                strokeWidth={strokeWidth} 
                className="opacity-40"
            />
            
            {/* The Connecting Path: Dashed Tech Line */}
            <path 
                d="M13 13L18 18" 
                stroke="currentColor" 
                strokeWidth={1.5} 
                strokeDasharray="2 1.5"
                strokeLinecap="round"
            />
            
            {/* The Plugin Module: Solid Connection Point */}
            <circle 
                cx="18" 
                cy="18" 
                r="3" 
                fill="currentColor" 
            />
            
            {/* Technical Detail: Precision '+' marker */}
            <path 
                d="M18 18H18.5 M18 17.5V18.5" 
                stroke="white" 
                strokeWidth={0.5} 
                className="opacity-50"
            />
            
            {/* Expansion Accent: Vertical modular bar */}
            <path 
                d="M18 4V8" 
                stroke="currentColor" 
                strokeWidth={1.5} 
                strokeLinecap="round"
                className="opacity-20"
            />
        </svg>
    );
};


