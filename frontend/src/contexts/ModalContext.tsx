import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MODAL_IDS } from '../constants/modalIds';
import { ModalPayloadMap } from '../registry/modalTypes';

type ModalId = Exclude<keyof ModalPayloadMap, MODAL_IDS.LIGHTBOX>;
type ModalState = { id: ModalId; props: ModalPayloadMap[ModalId] };
type AnyModalId = keyof ModalPayloadMap;

interface ModalContextType {
    modalStack: ModalState[];
    openModal: <K extends AnyModalId>(id: K, props?: ModalPayloadMap[K]) => void;
    closeModal: () => void;
    isModalOpen: (id: AnyModalId) => boolean;
    
    // Lightbox System
    lightbox: {
        isOpen: boolean;
        mediaUrls: string[];
        initialIndex: number;
    };
    openLightbox: (urls: string[], index: number) => void;
    closeLightbox: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * ModalProvider: The Unified Modal Engine for Arteo (Stack Support).
 * Manages a stack of modals for complex layered interactions.
 */
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modalStack, setModalStack] = useState<ModalState[]>([]);
    const [lightbox, setLightbox] = useState({
        isOpen: false,
        mediaUrls: [] as string[],
        initialIndex: 0
    });

    const openModal = useCallback(<K extends AnyModalId>(id: K, props: ModalPayloadMap[K] = {} as ModalPayloadMap[K]) => {
        if (id === MODAL_IDS.LIGHTBOX) {
            const lightboxProps = props as ModalPayloadMap[MODAL_IDS.LIGHTBOX];
            setLightbox({
                isOpen: true,
                mediaUrls: lightboxProps?.mediaUrls || [],
                initialIndex: lightboxProps?.initialIndex || 0
            });
            return;
        }
        setModalStack(prev => [
            ...prev,
            { id: id as ModalId, props: props as ModalPayloadMap[ModalId] }
        ]);
    }, []);

    const closeModal = useCallback(() => {
        setModalStack(prev => prev.slice(0, -1));
    }, []);

    const isModalOpen = useCallback((id: AnyModalId) => {
        if (id === MODAL_IDS.LIGHTBOX) return lightbox.isOpen;
        return modalStack.some(m => m.id === id);
    }, [modalStack, lightbox.isOpen]);

    const openLightbox = useCallback((urls: string[], index: number = 0) => {
        setLightbox({ isOpen: true, mediaUrls: urls, initialIndex: index });
    }, []);

    const closeLightbox = useCallback(() => {
        setLightbox(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Stable Body Management - Majestic Platinum Standard
    React.useEffect(() => {
        const isActive = modalStack.length > 0 || lightbox.isOpen;
        if (isActive) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('has-active-modal');
            document.documentElement.classList.add('has-active-modal');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('has-active-modal');
            document.documentElement.classList.remove('has-active-modal');
        }
    }, [modalStack.length, lightbox.isOpen]);

    React.useEffect(() => {
        return () => {
            document.documentElement.classList.remove('has-active-modal');
            document.body.classList.remove('has-active-modal');
            document.body.style.overflow = '';
        };
    }, []);

    const value = useMemo(() => ({
        modalStack,
        openModal,
        closeModal,
        isModalOpen,
        lightbox,
        openLightbox,
        closeLightbox
    }), [modalStack, openModal, closeModal, isModalOpen, lightbox, openLightbox, closeLightbox]);

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

