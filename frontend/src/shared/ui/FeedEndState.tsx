import React from 'react';
import { Text } from '@shared/ui';
import { Sparkles } from 'lucide-react';
import { cn } from '@shared/lib';
import { useTranslation } from 'react-i18next';

interface FeedEndStateProps {
    message?: string;
    showIcon?: boolean;
    className?: string;
}

/**
 * Shows a calm end-of-feed message once the user has reached the end.
 */
export const FeedEndState: React.FC<FeedEndStateProps> = ({ 
    message, 
    showIcon = false,
    className 
}) => {
    const { t } = useTranslation();
    const finalMessage = message || t('feed.end_of_feed');

    return (
        <div className={cn(
            "py-16 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-1000",
            className
        )}>
            {showIcon && (
                <Sparkles 
                    className="w-5 h-5 text-zinc-300 mb-3" 
                    strokeWidth={1.2} 
                />
            )}
            <Text 
                variant="caption" 
                color="muted" 
                className="font-medium tracking-tight"
            >
                {finalMessage}
            </Text>
            
            {/* Optional subtle divider */}
            <div className="w-8 h-[1px] bg-zinc-100 mt-6" />
        </div>
    );
};
