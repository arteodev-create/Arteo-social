import React from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@shared/lib';

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: string;
    className?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    children?: React.ReactNode;
    size?: 'large' | 'small';
    centered?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    className = "",
    showBackButton = false,
    onBackClick,
    children,
    size = 'large',
    centered = false
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={cn(
            "sticky top-0 z-[100] w-full bg-[var(--bg-primary)] border-b border-black",
            className
        )}>
            <div
                className={cn(
                    "relative flex w-full items-center px-5 md:px-6",
                    size === 'large' ? 'h-[72px]' : 'h-[60px]'
                )}
            >

                {/* Left Slot: Back Button */}
                <div className={cn(
                    "flex items-center z-10 shrink-0",
                    centered ? "min-w-[40px]" : "w-auto"
                )}>
                    {showBackButton ? (
                        <button
                            onClick={handleBack}
                            className={cn(
                                "h-9 w-9 -ml-2 active:bg-[var(--bg-secondary)] border border-transparent hover:border-black transition-colors cursor-pointer text-[var(--text-primary)] outline-none focus:ring-0 flex items-center justify-center",
                            )}
                        >
                            <ArrowLeft size={20} weight="bold" />
                        </button>
                    ) : (
                        centered && <div className="w-6" />
                    )}
                </div>

                {/* Center/Main Slot: Title & Subtitle */}
                <div
                    className={cn(
                        "flex flex-col min-w-0 flex-1 z-10 transition-all duration-300 mx-2",
                        centered ? 'items-center text-center' : 'items-start',
                    )}
                >
                    {typeof title === 'string' ? (
                        <h1
                            className={cn(
                                "font-extrabold text-[var(--text-primary)] tracking-tight truncate leading-tight font-display transition-all duration-300 w-full",
                                size === 'large' ? 'text-[22px]' : 'text-[17px]'
                            )}
                        >
                            {title}
                        </h1>
                    ) : (
                        <div className="transition-all duration-300 max-w-full flex justify-center">
                            {title}
                        </div>
                    )}
                    
                    {subtitle && (
                        <p
                            className={cn(
                                "text-[var(--text-muted)] font-bold truncate leading-none font-readable w-full opacity-70",
                                size === 'large' ? 'text-[13px] mt-1.5' : 'text-[11px] mt-1'
                            )}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right Slot: Children/Actions */}
                <div
                    className={cn(
                        "flex items-center justify-end z-10 shrink-0",
                        centered ? "min-w-[40px]" : "ml-4"
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
