import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link, useNavigationType } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    IdentificationCard, 
    SignOut, 
    Binoculars,
    Selection,
    DotsThreeVertical,
    NotePencil,
    CaretRight,
    ArrowLeft,
    Sun,
    ShieldCheck,
    Books
} from '@phosphor-icons/react';
import { useAuth } from '@entities/session/model';
import { cn } from '@shared/lib';
import { Logo } from '@shared/ui';
import { useModal } from '../../contexts/ModalContext';
import { MODAL_IDS } from '@constants/modalIds';
import { useScrollMemory } from '@shared/lib';
import { BackToTop } from '@shared/ui';
import { useDesignSystem } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';

interface MainLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    authLoading?: boolean;
    onCreatePost?: () => void;
    rightSidebar?: React.ReactNode;
    layoutMode?: 'standard' | 'wide' | 'full';
    scrollKey?: string | null;
}

const LAUNCH_CORE_ONLY = true;
const SHOW_ALGORITHMS = true;
const SHOW_PLUGINS = false;

/**
 * [AIS] MainLayout (Master Platinum Architecture v4.0)
 * Pure grid-lock stability with zero layout shift during route changes.
 * Consolidates all legacy structures into one single source of truth.
 * Integrated "TRONG" sidebars with 100dvh height and hidden scrollbars.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ 
    children, 
    showSidebar = true, 
    authLoading,
    onCreatePost,
    rightSidebar,
    layoutMode = 'standard',
    scrollKey
}) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { openModal } = useModal();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const [optionsView, setOptionsView] = useState<'main' | 'appearance'>('main');
    const { 
        theme: currentTheme, 
        setTheme: setCurrentTheme, 
        navPosition, 
        setNavPosition,
        modalSize,
        setModalSize,
        siteIcon,
        setSiteIcon
    } = useDesignSystem();
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    // Theme logic is now handled globally in DesignSystemProvider.tsx

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
                setIsOptionsMenuOpen(false);
                setTimeout(() => setOptionsView('main'), 300); // Reset after exit animation
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeTab = useMemo(() => {
        if (pathname === '/' || pathname === '/home') return 'feed';
        if (pathname.startsWith('/plugins')) return 'plugins';
        if (pathname.startsWith('/algorithms')) return 'algorithms';
        if (pathname === '/search') return 'search';
        if (pathname === '/search') return 'search';
        if (pathname.startsWith('/settings')) return 'settings';
        if (pathname.startsWith('/profile') || (user?.username && pathname === `/${user.username}`)) return 'profile';
        return '';
    }, [pathname, user?.username]);

    // Use custom scrollKey when provided, otherwise default to pathname.
    const finalScrollKey = scrollKey !== undefined ? scrollKey : pathname;
    useScrollMemory(finalScrollKey, scrollContainerRef);

    const navType = useNavigationType();

    // Scroll behavior:
    // - Keep current position for route transitions.
    // - Restore per-page position through useScrollMemory.
    React.useLayoutEffect(() => {
        // Intentionally left blank: this hook exists for future scroll tuning.
    }, [pathname, navType]);

    const handleCreateClick = useCallback(() => {
        if (onCreatePost) {
            onCreatePost();
        } else {
            openModal(MODAL_IDS.CREATE_POST);
        }
    }, [onCreatePost, openModal]);

    // [ABS-14.1 PLATINUM] Wide Mode Majestic Modal Logic
    const [showWideModal, setShowWideModal] = useState(false);

    useEffect(() => {
        const hasNotified = sessionStorage.getItem('arteo_wide_notified');
        if (layoutMode !== 'standard' && !hasNotified) {
            setShowWideModal(true);
            sessionStorage.setItem('arteo_wide_notified', 'true');
        }
    }, [layoutMode]);

    const isGuest = !user && !authLoading;

    // Navigation Items Definition for reuse
    const navItems = useMemo(() => ([
        { id: 'feed', icon: Selection, path: '/', label: t('nav.home') },
        !LAUNCH_CORE_ONLY && { id: 'search', icon: Binoculars, path: '/search', label: t('nav.search') },
        SHOW_ALGORITHMS && { id: 'algorithms', icon: Books, path: '/algorithms', label: 'Algorithms' },
        SHOW_PLUGINS && { id: 'plugins', icon: Books, path: '/plugins', label: 'Library' },
        !LAUNCH_CORE_ONLY && ((user as any)?.isAdmin) && { id: 'admin', icon: ShieldCheck, path: '/admin', label: t('layout.admin') },
        { id: 'create', icon: NotePencil, action: handleCreateClick, label: t('nav.create') },
        { id: 'profile', icon: IdentificationCard, path: user?.username ? `/${user?.username}` : `/profile`, label: t('nav.profile') }
    ].filter(Boolean) as Array<{
        id: string;
        icon: React.ComponentType<{ size?: number; weight?: any; className?: string }>;
        path?: string;
        action?: () => void;
        label: string;
    }>), [user, t, handleCreateClick]);

    const optionsMenuContent = (
        optionsView === 'main' ? (
            <div className="flex flex-col">
                <OptionMenuItem label={t('layout.appearance')} showArrow onClick={() => setOptionsView('appearance')} />
                {!LAUNCH_CORE_ONLY && (
                    <>
                        <OptionMenuItem label={t('layout.details')} onClick={() => setIsOptionsMenuOpen(false)} />
                        <OptionMenuItem label={t('layout.settings')} onClick={() => { navigate('/settings'); setIsOptionsMenuOpen(false); }} />

                        <div className="h-[1px] bg-[var(--border-primary)] my-1 mx-2" />

                        <OptionMenuItem label={t('layout.feed_board')} showArrow onClick={() => setIsOptionsMenuOpen(false)} />
                        <OptionMenuItem label={t('layout.saved')} onClick={() => setIsOptionsMenuOpen(false)} />
                        <OptionMenuItem label={t('layout.likes')} onClick={() => setIsOptionsMenuOpen(false)} />

                        <div className="h-[1px] bg-[var(--border-primary)] my-1 mx-2" />

                        <OptionMenuItem label={t('layout.report_issue')} onClick={() => setIsOptionsMenuOpen(false)} />
                    </>
                )}
                <div className="h-[1px] bg-[var(--border-primary)] my-1 mx-2" />
                <OptionMenuItem label={t('layout.logout')} onClick={() => { logout(); setIsOptionsMenuOpen(false); }} isDanger />
            </div>
        ) : (
            <div className="flex flex-col p-2">
                <div className="flex items-center gap-3 mb-4 px-2 text-[var(--text-primary)]">
                    <button 
                        onClick={() => setOptionsView('main')}
                                className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        <ArrowLeft size={18} weight="bold" />
                    </button>
                    <span className="font-bold text-[16px] flex-1 text-center pr-8">{t('layout.appearance')}</span>
                </div>

                <div className="space-y-4">
                    <div className="px-2">
                        <div className="text-[12px] font-bold text-[var(--text-muted)] mb-2 px-1">{t('layout.theme_mode')}</div>
                        <div className="bg-[var(--bg-secondary)] rounded-[8px] p-1 flex items-center gap-1 border border-[var(--border-primary)]">
                            <button 
                                onClick={() => setCurrentTheme('light')}
                                className={cn(
                                    "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px]",
                                    currentTheme === 'light' ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                <Sun size={18} weight="bold" />
                            </button>
                        </div>
                    </div>

                    <div className="px-2">
                        <div className="text-[12px] font-bold text-[var(--text-muted)] mb-2 px-1">{t('layout.navigation_position')}</div>
                        <div className="bg-[var(--bg-secondary)] rounded-[8px] p-1 flex items-center gap-1 border border-[var(--border-primary)]">
                            <button 
                                onClick={() => setNavPosition('left')}
                                className={cn(
                                    "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px] text-[12px] font-bold",
                                    navPosition === 'left' ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {t('layout.vertical_left')}
                            </button>
                            <button 
                                onClick={() => setNavPosition('top')}
                                className={cn(
                                    "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px] text-[12px] font-bold",
                                    navPosition === 'top' ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {t('layout.horizontal_top')}
                            </button>
                        </div>
                    </div>

                    <div className="px-2 pb-2">
                        <div className="text-[12px] font-bold text-[var(--text-muted)] mb-2 px-1">{t('layout.modal_size')}</div>
                        <div className="bg-[var(--bg-secondary)] rounded-[8px] p-1 flex items-center gap-1 border border-[var(--border-primary)]">
                            <button 
                                onClick={() => setModalSize('standard')}
                                className={cn(
                                    "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px] text-[12px] font-bold",
                                    modalSize === 'standard' ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-secondary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {t('layout.standard')}
                            </button>
                            <button 
                                onClick={() => setModalSize('full')}
                                className={cn(
                                    "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px] text-[12px] font-bold",
                                    modalSize === 'full' ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-secondary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {t('layout.fullscreen')}
                            </button>
                        </div>
                    </div>

                    <div className="px-2 pb-4">
                        <div className="text-[12px] font-bold text-[var(--text-muted)] mb-2 px-1">{t('layout.icon_set')}</div>
                        <div className="bg-[var(--bg-secondary)] rounded-[8px] p-1 flex items-center gap-1 border border-[var(--border-primary)]">
                            {[1, 2, 3].map((id) => (
                                <button 
                                    key={id}
                                    onClick={() => setSiteIcon(id)}
                                    className={cn(
                                        "flex-1 h-10 flex items-center justify-center transition-all duration-300 rounded-[6px] gap-2",
                                        siteIcon === id ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-secondary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    )}
                                >
                                    <img src={`/icon/icon-${id}/favicon-16x16.png`} alt="" className="w-4 h-4 rounded-[4px]" />
                                    <span className="text-[11px] font-bold">{t('layout.set_n', { id })}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="h-screen bg-[var(--bg-secondary)] text-black selection:bg-black selection:text-white overflow-hidden flex flex-col">
            
            {/* Wide Mode Majestic Modal */}
            <AnimatePresence>
                {showWideModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 "
                            onClick={() => setShowWideModal(false)}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[420px] bg-[var(--bg-primary)] border border-black rounded-[8px] p-8 text-left space-y-8 shadow-none"
                        >
                            <div className="flex justify-center">
                                <div className="w-20 h-12 rounded-[8px] border border-[var(--border-primary)] flex items-center justify-center p-1.5 overflow-hidden bg-[var(--bg-secondary)]">
                                    <motion.div 
                                        animate={{ 
                                            width: ['20%', '100%', '20%'],
                                            opacity: [0.3, 1, 0.3]
                                        }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            duration: 3, 
                                            ease: "easeInOut" 
                                        }}
                                        className="h-full bg-[var(--text-primary)] rounded-[4px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-[24px] font-bold tracking-tight">
                                    {t('layout.wide_mode_title')}
                                </h2>
                                <p className="text-[14px] text-zinc-500 font-medium leading-relaxed">
                                    {t('layout.wide_mode_desc')}
                                </p>
                            </div>

                            <button 
                                onClick={() => setShowWideModal(false)}
                                className="w-full h-12 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[8px] font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
                            >
                                {t('layout.get_started')}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 1. TOP NAVIGATION (Header Mode) */}
            {navPosition === 'top' && (
                <header className={cn(
                    "w-full h-16 flex-shrink-0 bg-[var(--bg-primary)] border-b border-black z-[1000] px-6 flex items-center transition-opacity duration-300",
                    (isGuest || authLoading || !showSidebar) ? 'opacity-0 pointer-events-none' : 'opacity-100'
                )}>
                    <div className="w-full flex items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex-1 flex justify-start">
                            <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
                                <Logo size={32} />
                            </Link>
                        </div>

                        {/* Center: Navigation Icons */}
                        <nav className="flex items-center gap-1 md:gap-2 bg-[var(--bg-primary)] p-1 border border-black">
                            {navItems.map((item) => {
                                const isActive = activeTab === item.id;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (item.action) {
                                                item.action();
                                            } else if (item.path === pathname) {
                                                const isHome = item.path === '/' || item.path === '/feed';
                                                if (!isHome) {
                                                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                                }
                                            } else if (item.path) {
                                                navigate(item.path);
                                            }
                                        }}
                                        className={cn(
                                            "relative h-10 w-10 md:w-12 flex items-center justify-center transition-all active:scale-90 border border-transparent",
                                            isActive ? "text-white bg-black border-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-black"
                                        )}
                                        title={item.label}
                                    >
                                        <Icon size={isActive ? 24 : 22} weight={isActive ? "bold" : "thin"} />
                                        {isActive && (
                                            <motion.div 
                                                layoutId="nav-indicator-top"
                                                className="absolute -bottom-1 w-4 h-[2px] bg-black"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        
                        {/* Right: Options & Logout */}
                        <div className="flex-1 flex justify-end items-center gap-2">
                            <div className="relative" ref={optionsMenuRef}>
                                <button
                                    onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center transition-all border border-transparent",
                                        isOptionsMenuOpen ? "bg-black text-white border-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-black"
                                    )}
                                >
                                    <DotsThreeVertical size={24} weight="bold" />
                                </button>
                                <AnimatePresence>
                                    {isOptionsMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-[240px] bg-[var(--bg-primary)] border border-black rounded-[8px] shadow-none z-[100] overflow-hidden p-2"
                                        >
                                            {optionsMenuContent}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* MAIN CONTENT AREA */}
            <div className={cn(
                "w-full flex-1 overflow-hidden bg-[var(--bg-secondary)]",
                navPosition === 'left' ? (
                    layoutMode === 'full'
                        ? 'grid grid-cols-1 md:grid-cols-[88px_minmax(0,1fr)] md:gap-4 md:p-4 lg:p-6'
                        : cn(
                            'grid grid-cols-1 md:grid-cols-[88px_minmax(0,1fr)] md:gap-4 md:p-4',
                            layoutMode === 'wide'
                                ? 'lg:grid-cols-[minmax(24px,1fr)_88px_1040px_minmax(24px,1fr)] lg:gap-6 lg:p-6'
                                : 'lg:grid-cols-[minmax(24px,1fr)_88px_720px_minmax(24px,1fr)] lg:gap-6 lg:p-6'
                        )
                ) : (
                    // Top Navigation: Use flex to center the content pillar perfectly
                    'flex justify-center p-4 lg:p-6'
                )
            )}>
                
                {/* 1. NAVIGATION SLOT (Column 1 - Sidebar) */}
                {navPosition === 'left' && (
                    <div className="hidden md:flex justify-end bg-transparent lg:col-start-2">
                        <div className={`
                            w-full flex justify-end transition-opacity duration-300
                            ${(isGuest || authLoading || !showSidebar) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                        `}>
                            <aside className="w-[88px] h-full max-h-[calc(100vh-32px)] lg:max-h-[calc(100vh-48px)] sticky top-4 lg:top-6 flex flex-col items-center py-6 z-50 overflow-visible no-scrollbar border border-black bg-white">
                                {/* Logo */}
                                <Link 
                                    to="/" 
                                    className="mb-12 flex h-11 w-11 flex-col items-center justify-center relative z-10 bg-white border border-black cursor-pointer"
                                >
                                    <Logo size={32} color="var(--text-primary)" />
                                </Link>

                                <nav className="flex-1 flex flex-col items-center gap-5 w-full relative z-10">
                                    {navItems.map((item) => {
                                        const isActive = activeTab === item.id;
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.action) {
                                                        item.action();
                                                    } else if (item.path === pathname) {
                                                        const isHome = item.path === '/' || item.path === '/feed';
                                                        if (!isHome) {
                                                            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    } else if (item.path) {
                                                        navigate(item.path);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-11 h-11 border border-black flex items-center justify-center relative z-10",
                                                    isActive 
                                                        ? "bg-black text-white" 
                                                        : "bg-white text-black"
                                                )}
                                                title={item.label}
                                            >
                                                <Icon size={isActive ? 28 : 26} weight="regular" />
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="nav-indicator"
                                                        className="absolute -right-[23px] w-[3px] h-8 bg-black"
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-auto flex flex-col items-center gap-4 relative z-10 pb-6">
                                    {/* Options Button & Menu */}
                                    <div className="relative" ref={optionsMenuRef}>
                                        <button
                                            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                                            className={cn(
                                                "w-11 h-11 border border-black flex items-center justify-center",
                                                isOptionsMenuOpen ? "bg-black text-white" : "bg-white text-black"
                                            )}
                                            title={t('nav.options')}
                                        >
                                            <DotsThreeVertical size={28} weight="regular" />
                                        </button>

                                        <AnimatePresence mode="wait">
                                            {isOptionsMenuOpen && (
                                                <motion.div
                                                    key={optionsView}
                                                    initial={{ opacity: 0, scale: 0.95, x: 10, y: 0 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute left-full bottom-0 ml-3 w-[240px] bg-white border border-black z-[100] overflow-hidden p-2"
                                                >
                                                    {optionsMenuContent}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={logout}
                                        className="w-11 h-11 border border-black flex items-center justify-center text-black bg-white"
                                        title={t('nav.logout')}
                                    >
                                        <SignOut size={26} weight="regular" />
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}

                {/* 2. MAIN PILLAR (Column 2) */}
                <main className={cn(
                    "flex flex-col min-w-0 bg-white relative border border-black overflow-hidden md:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)]",
                    navPosition === 'left' ? "md:col-start-2" : "",
                    layoutMode !== 'full' && navPosition === 'left' ? "lg:col-start-3" : "",
                    layoutMode === 'full' && navPosition === 'left' ? "lg:col-start-2 lg:col-span-3" : ""
                )}>
                    <div className={cn(
                        "w-full flex-1 flex flex-col h-full relative mx-auto",
                        layoutMode === 'full' ? 'max-w-none' : layoutMode === 'wide' ? 'lg:w-[1040px] lg:min-w-[1040px]' : 'lg:w-[720px] lg:min-w-[720px]'
                    )}>
                        {authLoading ? (
                            <div className="flex-1 flex items-center justify-center h-screen">
                                 <LoadingSpinner size="lg" label="Authenticating Arteo Node..." />
                            </div>
                        ) : (
                            <div 
                                ref={scrollContainerRef}
                                className="w-full flex-1 flex flex-col h-full overflow-y-auto scroll-smooth no-scrollbar relative"
                            >
                                {/* [ABS-14.1 PLATINUM] Stable Content Pillar */}
                                <div className="w-full flex-1 flex flex-col transition-opacity duration-200">
                                    {children}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* 3. RIGHT DISCOVERY (Column 3 - Counter-balance) */}
                <div className={cn(
                    "hidden lg:flex justify-start bg-transparent",
                    navPosition === 'left' ? "lg:col-start-4" : ""
                )}>
                    {(showSidebar && rightSidebar && layoutMode === 'standard') && (
                        <aside className="w-[350px] h-screen sticky top-0 flex flex-col py-6 px-6 z-10 overflow-y-auto no-scrollbar">
                            <div className="flex flex-col gap-6">
                                {rightSidebar}
                            </div>
                        </aside>
                    )}
                </div>

                {/* Floating Action Button (Mobile Only) */}
                {(!isGuest && !authLoading) && (
                    <button
                        onClick={handleCreateClick}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[8px] shadow-none flex items-center justify-center z-[200] md:hidden transition-all active:scale-95"
                    >
                        <NotePencil size={28} weight="regular" />
                    </button>
                )}
                {/* Floating Back To Top Button */}
                <BackToTop scrollRef={scrollContainerRef} />
            </div>
        </div>
    );
};

const OptionMenuItem: React.FC<{
    label: string;
    onClick: () => void;
    showArrow?: boolean;
    isDanger?: boolean;
    className?: string;
}> = ({ label, onClick, showArrow, isDanger, className }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] transition-all text-[14px] font-black active:bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]",
            isDanger ? "text-red-500" : "text-[var(--text-primary)]",
            className
        )}
    >
        <span className="flex-1 text-left">{label}</span>
        {showArrow && <CaretRight size={14} weight="bold" className="text-[var(--text-muted)]" />}
    </button>
);

export default MainLayout;
