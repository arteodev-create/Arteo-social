import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type DesignCategory = 'auth' | 'feed' | 'studio' | 'legal' | 'default';
type ThemeMode = 'light';
type NavPosition = 'left' | 'top';
type ModalSize = 'standard' | 'full';

interface DesignSystemContextType {
    category: DesignCategory;
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    navPosition: NavPosition;
    setNavPosition: (pos: NavPosition) => void;
    modalSize: ModalSize;
    setModalSize: (size: ModalSize) => void;
    siteIcon: number;
    setSiteIcon: (id: number) => void;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export const useDesignSystem = () => {
    const context = useContext(DesignSystemContext);
    if (!context) throw new Error('useDesignSystem must be used within a DesignSystemProvider');
    return context;
};

export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { pathname } = useLocation();
    const [category, setCategory] = useState<DesignCategory>('default');
    const [theme, setThemeState] = useState<ThemeMode>('light');
    const [navPosition, setNavPositionState] = useState<NavPosition>(() => {
        return (localStorage.getItem('arteo-nav-position') as NavPosition) || 'left';
    });
    const [modalSize, setModalSizeState] = useState<ModalSize>(() => {
        return (localStorage.getItem('arteo-modal-size') as ModalSize) || 'standard';
    });
    const [siteIcon, setSiteIconState] = useState<number>(() => {
        return Number(localStorage.getItem('arteo-site-icon')) || 1;
    });

    const setTheme = (_newTheme: ThemeMode) => {
        setThemeState('light');
        localStorage.setItem('arteo-theme', 'light');
    };

    const setNavPosition = (pos: NavPosition) => {
        setNavPositionState(pos);
        localStorage.setItem('arteo-nav-position', pos);
    };

    const setModalSize = (size: ModalSize) => {
        setModalSizeState(size);
        localStorage.setItem('arteo-modal-size', size);
    };

    const setSiteIcon = (id: number) => {
        setSiteIconState(id);
        localStorage.setItem('arteo-site-icon', String(id));
    };

    useEffect(() => {
        const updateSiteIdentity = () => {
            const head = document.getElementsByTagName('head')[0];

            const existingIcons = document.querySelectorAll("link[rel*='icon']");
            existingIcons.forEach(link => head.removeChild(link));

            const iconPath = `/icon/icon-${siteIcon}`;

            const link = document.createElement('link');
            link.rel = 'shortcut icon';
            link.href = `${iconPath}/favicon.ico`;
            head.appendChild(link);

            const icon32 = document.createElement('link');
            icon32.rel = 'icon';
            icon32.type = 'image/png';
            icon32.setAttribute('sizes', '32x32');
            icon32.href = `${iconPath}/favicon-32x32.png`;
            head.appendChild(icon32);

            const icon16 = document.createElement('link');
            icon16.rel = 'icon';
            icon16.type = 'image/png';
            icon16.setAttribute('sizes', '16x16');
            icon16.href = `${iconPath}/favicon-16x16.png`;
            head.appendChild(icon16);

            const apple = document.createElement('link');
            apple.rel = 'apple-touch-icon';
            apple.setAttribute('sizes', '180x180');
            apple.href = `${iconPath}/apple-icon-180x180.png`;
            head.appendChild(apple);

            const existingManifest = document.querySelector("link[rel='manifest']");
            if (existingManifest) head.removeChild(existingManifest);

            const msConfig = document.querySelector("meta[name='msapplication-config']");
            if (msConfig) msConfig.setAttribute('content', `${iconPath}/browserconfig.xml`);

            const tileImage = document.querySelector("meta[name='msapplication-TileImage']");
            if (tileImage) tileImage.setAttribute('content', `${iconPath}/ms-icon-144x144.png`);
        };

        updateSiteIdentity();
    }, [siteIcon]);

    useEffect(() => {
        let currentCategory: DesignCategory = 'default';

        if (pathname === '/' || pathname.startsWith('/@') || pathname.startsWith('/p/') || pathname === '/search' || pathname.startsWith('/post')) {
            currentCategory = 'feed';
        } else if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify') || pathname.startsWith('/forgot') || pathname.startsWith('/reset') || pathname.startsWith('/setup')) {
            currentCategory = 'auth';
        } else if (pathname.startsWith('/plugins') || pathname.startsWith('/algorithms')) {
            currentCategory = 'studio';
        } else if (pathname === '/terms' || pathname === '/privacy' || pathname === '/about') {
            currentCategory = 'legal';
        }

        setCategory(currentCategory);

        const body = document.body;
        body.classList.remove('theme-auth', 'theme-feed', 'theme-studio', 'theme-legal', 'theme-default');
        body.classList.add(`theme-${currentCategory}`);
    }, [pathname]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        localStorage.setItem('arteo-theme', 'light');
    }, [theme]);

    return (
        <DesignSystemContext.Provider value={{ category, theme, setTheme, navPosition, setNavPosition, modalSize, setModalSize, siteIcon, setSiteIcon }}>
            <div className={`design-root theme-${category} nav-${navPosition}`}>
                {children}
            </div>
        </DesignSystemContext.Provider>
    );
};

