import { useTranslation } from 'react-i18next';
import { EMPTY_STATES, EmptyStateCode } from '../../constants/emptyStates';
import { Text, Button } from '@shared/ui';

interface EmptyStateProps {
    type: EmptyStateCode;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    type, 
    title, 
    description, 
    action, 
    className = "" 
}) => {
    const { t } = useTranslation();
    const config = EMPTY_STATES[type];
    if (!config) return null;

    const displayTitle = title || t(config.title);
    const displayDescription = description || t(config.description);

    return (
        <div className={`flex flex-col items-center justify-center min-h-[50vh] px-6 text-center ${className}`}>
            <div className="max-w-[280px] animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <Text variant="h3" className="mb-2 tracking-tight">
                    {displayTitle}
                </Text>
                <Text variant="caption" color="secondary" className="leading-[1.8] opacity-70 tracking-tight">
                    {displayDescription}
                </Text>
            </div>
            
            {action && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-700 delay-200">
                    <Button
                        onClick={action.onClick}
                        variant="primary"
                        className="px-8 h-12 rounded-[8px] font-bold text-[14px] shadow-none active:scale-[0.98]"
                    >
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
