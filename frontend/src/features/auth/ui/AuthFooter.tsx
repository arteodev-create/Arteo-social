import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * AuthFooter (Majestic v1.1)
 * Cleaned up selection of links for the Identity Gateway.
 * Design is delegated into the parent container for maximum layout flexibility.
 */
const AuthFooter: React.FC = () => {
    const { t } = useTranslation();
    
    // Translation keys are assumed to be handled or fallback to strings
    const links = [
        { label: t('footer.about', 'About'), id: 'about' },
        { label: t('footer.help', 'Assistance'), id: 'help' },
        { label: t('footer.terms', 'Terms'), id: 'terms' },
        { label: t('footer.privacy', 'Privacy'), id: 'privacy' },
        { label: t('footer.cookies', 'Cookies'), id: 'cookies' },
        { label: t('footer.copyright', 'Copyright'), id: 'copyright' },
        { label: t('footer.ads', 'Advertising'), id: 'ads' },
        { label: t('footer.marketing', 'Marketing'), id: 'marketing' },
        { label: t('footer.business', 'Arteo for Business'), id: 'business' },
        { label: t('footer.developers', 'Developers'), id: 'developers' },
        { label: t('footer.directory', 'Directory'), id: 'directory' },
        { label: t('footer.settings', 'Settings'), id: 'settings' },
        { label: 'TikTok', id: 'tiktok', url: 'https://www.tiktok.com/@arteoapp' },
        { label: 'X (Twitter)', id: 'x', url: 'https://x.com/ArteoApp' }
    ];

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-x-6 gap-y-3">
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                {links.map((link: any) => (
                    <a 
                        key={link.id} 
                        href={link.url || '#'}
                        target={link.url ? "_blank" : undefined}
                        rel={link.url ? "noreferrer" : undefined}
                        className="text-[12px] text-zinc-400 hover:text-white active:text-zinc-300 transition-colors duration-300 font-bold"
                    >
                        {link.label}
                    </a>
                ))}
            </nav>
            
            <div className="text-[12px] text-zinc-500 font-bold whitespace-nowrap">
                Do Gia Huy By Arteo Social
            </div>
        </div>
    );
};

export default AuthFooter;

