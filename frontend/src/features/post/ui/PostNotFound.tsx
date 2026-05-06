import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@shared/ui';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface NotFoundProps {
    title?: string;
    message?: string;
    onBack?: () => void;
    showHomeButton?: boolean;
}

const NotFound: React.FC<NotFoundProps> = ({
    title = "404",
    message = "This page does not exist.",
    onBack,
    showHomeButton = true
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <Helmet>
                <title>{t('titles.not_found')} | Arteo</title>
            </Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full"
            >
                {/* Minimal Icon/Text */}
                <h1 className="text-[120px] font-bold text-[var(--app-text)] leading-none opacity-[0.03] select-none">
                    404
                </h1>

                <div className="-mt-16 relative z-10">
                    <h2 className="empty-state-text text-xl mb-4">
                        {title === "404" ? t('titles.not_found') : title}
                    </h2>

                    <p className="text-zinc-400 text-[14px] font-medium mb-8 leading-relaxed max-w-xs mx-auto">
                        {message === "This page does not exist." ? t('not_found_page_desc', 'The page you are looking for does not exist or has been moved.') : message}
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={handleBack}
                            className="group gap-2 px-8 rounded-[8px]"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>{t('onboarding.back')}</span>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;

