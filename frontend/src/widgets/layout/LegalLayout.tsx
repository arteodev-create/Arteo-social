import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@shared/ui';
import { Search, Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface LegalLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    title?: string;
    showSidebarMobile?: boolean;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, sidebar, title, showSidebarMobile = true }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { t } = useTranslation();

    return (
        <div className="bg-black text-[#e7e9ea] font-sans antialiased min-h-screen flex flex-col selection:bg-white/20 selection:text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black  border-b border-[#2f3336]">
                <div className="max-w-[1250px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <Logo size={28} color="#e7e9ea" />
                            <span className="text-xl font-bold tracking-tight hidden sm:block">{t('legal.help_center')}</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-[15px]">
                            <Link to="/support" className="text-[#71767b] hover:text-[#e7e9ea] transition-colors font-medium">{t('legal.using_arteo')}</Link>
                            <Link to="/security-center" className="text-[#71767b] hover:text-[#e7e9ea] transition-colors font-medium">{t('legal.security')}</Link>
                            <Link to="/privacy-policy" className="text-[#71767b] hover:text-[#e7e9ea] transition-colors font-medium">{t('legal.rules_policies')}</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71767b] group-focus-within:text-[#e7e9ea]">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('legal.search_help_center')}
                                className="bg-[#202327] text-[#e7e9ea] pl-10 pr-4 py-2 rounded-[0px] text-sm w-64 border border-transparent focus:border-[#e7e9ea] focus:bg-black focus:outline-none transition-all placeholder-[#71767b]"
                            />
                        </div>

                        <Link
                            to="/support"
                            className="hidden sm:block bg-[#e7e9ea] text-black px-4 py-1.5 rounded-[0px] text-sm font-bold hover:bg-[#d4d6d8] transition-colors"
                        >
                            {t('legal.contact_us')}
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-[#e7e9ea] hover:bg-[#181818] rounded-[0px]"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black pt-20 px-4 md:hidden overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767b]" size={18} />
                            <input
                                type="text"
                                placeholder={t('legal.search')}
                                className="w-full bg-[#202327] text-[#e7e9ea] pl-12 pr-4 py-3 rounded-[0px] text-base border border-transparent focus:border-[#e7e9ea] focus:outline-none placeholder-[#71767b]"
                            />
                        </div>
                        <nav className="flex flex-col gap-4 mt-4">
                            <Link to="/support" className="text-lg font-bold border-b border-[#2f3336] pb-4">{t('legal.using_arteo')}</Link>
                            <Link to="/security-center" className="text-lg font-bold border-b border-[#2f3336] pb-4">{t('legal.safety_security')}</Link>
                            <Link to="/privacy-policy" className="text-lg font-bold border-b border-[#2f3336] pb-4">{t('legal.rules_policies')}</Link>
                            <Link to="/terms" className="text-lg font-bold border-b border-[#2f3336] pb-4">{t('legal.terms_service')}</Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1250px] mx-auto w-full px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Sidebar (Left) */}
                    {sidebar ? (
                        <aside className={`md:col-span-3 ${showSidebarMobile ? 'block' : 'hidden md:block'}`}>
                            <div className="sticky top-24 space-y-8">
                                {sidebar}
                            </div>
                        </aside>
                    ) : (
                        <div className="hidden"></div>
                    )}

                    {/* Main Content (Right) */}
                    <main className={sidebar ? "md:col-span-9" : "md:col-span-12 max-w-4xl mx-auto"}>
                        {children}
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-[#2f3336] bg-black pt-12 pb-6 text-sm">
                <div className="max-w-[1250px] mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="space-y-4">
                            <h4 className="font-bold text-[#e7e9ea]">{t('legal.arteo_platform')}</h4>
                            <ul className="space-y-2 text-[#71767b]">
                                <li><Link to="/" className="hover:underline hover:text-[#e7e9ea]">{t('legal.about')}</Link></li>
                                <li><Link to="/locations" className="hover:underline hover:text-[#e7e9ea]">{t('legal.locations')}</Link></li>
                                <li><Link to="/" className="hover:underline hover:text-[#e7e9ea]">{t('legal.download_app')}</Link></li>
                                <li><Link to="/" className="hover:underline hover:text-[#e7e9ea]">{t('legal.accessibility')}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-[#e7e9ea]">{t('legal.help_center')}</h4>
                            <ul className="space-y-2 text-[#71767b]">
                                <li><Link to="/support" className="hover:underline hover:text-[#e7e9ea]">{t('legal.using_arteo')}</Link></li>
                                <li><Link to="/security-center" className="hover:underline hover:text-[#e7e9ea]">{t('legal.your_account')}</Link></li>
                                <li><Link to="/privacy-policy" className="hover:underline hover:text-[#e7e9ea]">{t('legal.safety_security')}</Link></li>
                                <li><Link to="/terms" className="hover:underline hover:text-[#e7e9ea]">{t('legal.rules')}</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-[#e7e9ea]">{t('legal.legal')}</h4>
                            <ul className="space-y-2 text-[#71767b]">
                                <li><Link to="/terms" className="hover:underline hover:text-[#e7e9ea]">{t('legal.terms_service')}</Link></li>
                                <li><Link to="/privacy-policy" className="hover:underline hover:text-[#e7e9ea]">{t('legal.privacy_policy')}</Link></li>
                                <li><Link to="/cookies" className="hover:underline hover:text-[#e7e9ea]">{t('legal.cookie_policy')}</Link></li>
                                <li><Link to="/privacy-settings" className="hover:underline hover:text-[#e7e9ea]">{t('legal.privacy_settings')}</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[#2f3336] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#71767b]">
                        <div className="flex gap-4 text-xs">
                            <Link to="/locations" className="hover:underline">{t('legal.locations')}</Link>
                            <Link to="/terms" className="hover:underline">{t('legal.terms')}</Link>
                            <Link to="/privacy-policy" className="hover:underline">{t('legal.privacy')}</Link>
                            <Link to="/cookies" className="hover:underline">{t('legal.cookies')}</Link>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Globe size={14} />
                            <button className="hover:underline">{t('legal.language_english_us')}</button>
                            <ChevronDown size={12} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LegalLayout;

