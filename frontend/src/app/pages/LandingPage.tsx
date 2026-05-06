import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@shared/ui';
import { Button } from '@shared/ui';
import { ARTEO_SOCIAL_LINKS, SocialLink } from '@constants/socialLinks';

import { useAuthStore } from '@entities/session/model';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center bg-white dark:bg-black selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black font-readable transition-colors duration-500">

            {/* Main Content */}
            <main className="relative z-10 w-full max-w-[800px] px-6 flex flex-col items-center text-center space-y-12">

                {/* Logo Area */}
                <div className="flex flex-col items-center gap-6">
                    <Logo size={60} color="currentColor" className="text-black dark:text-white" />
                    <span className="text-[20px] font-medium tracking-tight font-display text-black dark:text-white">Arteo</span>
                </div>

                {/* Headlines */}
                <div className="space-y-6">
                    <h1 className="text-[44px] md:text-[60px] font-medium leading-[1.2] tracking-tight font-display text-black dark:text-white">
                        {t('landing.hero_title')}
                    </h1>
                    <p className="text-[16px] md:text-[18px] font-normal text-zinc-500 dark:text-zinc-400 max-w-[540px] mx-auto leading-relaxed">
                        {t('landing.hero_desc')}
                    </p>
                </div>

                {/* Actions */}
                <div className="w-full max-w-[420px] space-y-4 pt-4">
                    <Button
                        onClick={() => navigate('/flow/register')}
                        className="w-full h-[72px] rounded-[8px] text-[15px] font-medium bg-black dark:bg-white text-white dark:text-black border-none hover:bg-black dark:hover:bg-white active:scale-95 transition-transform"
                    >
                        {t('landing.get_started')}
                    </Button>

                    <button
                        onClick={() => navigate('/flow/login')}
                        className="w-full h-[72px] rounded-[8px] text-[15px] font-medium border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all active:scale-95"
                    >
                        {t('auth.login')}
                    </button>
                </div>
            </main>

            {/* Stark Footer */}
            <footer className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-6 px-10">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate('/about')}
                        className="text-[13px] font-medium text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {t('landing.about')}
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    {ARTEO_SOCIAL_LINKS.map((link: SocialLink) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-black dark:hover:text-white transition-all duration-300 hover:scale-110"
                            title={link.name}
                        >
                            {link.icon(16)}
                        </a>
                    ))}
                </div>

                <div className="w-full max-w-[600px] h-[1px] bg-zinc-100 dark:bg-zinc-900" />

                <p className="text-[11px] text-zinc-400 font-medium tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Arteo Social
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;


