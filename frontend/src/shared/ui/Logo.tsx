import React from 'react';
import { cn } from '@shared/lib';

interface LogoProps {
    className?: string;
    size?: number;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 32, color = '#000' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 150 150"
            role="img"
            aria-label="Arteo network spark logo"
            className={cn('transition-transform duration-300', className)}
        >
            <rect width="150" height="150" fill="none" />
            <g fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
                <path d="M75 75L36 47" />
                <path d="M75 75L114 47" />
                <path d="M75 75L39 105" />
                <path d="M75 75L111 105" />
            </g>
            <g fill={color}>
                <circle cx="36" cy="47" r="13" />
                <circle cx="114" cy="47" r="13" />
                <circle cx="39" cy="105" r="13" />
                <circle cx="111" cy="105" r="13" />
                <path d="M75 37L88 56L111 63L94 80L96 104L75 94L54 104L56 80L39 63L62 56Z" />
            </g>
            <path fill="#fff" d="M75 59L81 69L92 72L84 80L85 92L75 87L65 92L66 80L58 72L69 69Z" />
        </svg>
    );
};

export default Logo;
