import React from 'react';

interface MarketplaceIconProps {
    size?: number;
    strokeWidth?: number;
    filled?: boolean;
    className?: string;
}

export const MarketplaceIcon: React.FC<MarketplaceIconProps> = ({ 
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
            {/* Arteo Pure Stroke: "The Stroke Mesh" (Synchronized Marketplace) */}
            <rect x="5" y="5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} fill={filled ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="14" y="5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} fill={filled ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="5" y="14" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} fill={filled ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="14" y="14" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} fill={filled ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

