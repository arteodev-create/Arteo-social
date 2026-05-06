import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useDesignSystem } from './DesignSystemProvider';
import { cn } from '@shared/lib';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    backdropStyle?: 'blur' | 'dim' | 'clean';
    animationType?: 'fadeScale' | 'slideUp' | 'fade';
    className?: string;
    zIndex?: number;
}

export const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    children,
    maxWidth = '500px',
    showCloseButton = false,
    closeOnOutsideClick = true,
    backdropStyle = 'blur',
    animationType = 'fadeScale',
    className = '',
    zIndex = 1000
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { modalSize } = useDesignSystem();
    const isFullSize = modalSize === 'full';

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Body management is now handled centrally in ModalProvider for better stability.

    const animations = {
        fadeScale: {
            initial: { opacity: 0, scale: isFullSize ? 1 : 0.98, y: isFullSize ? 0 : 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: isFullSize ? 1 : 0.98, y: isFullSize ? 0 : 10, transition: { duration: 0.15 } }
        },
        slideUp: {
            initial: { opacity: 0, y: '100%' },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: '100%', transition: { duration: 0.25 } }
        },
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        }
    };

    const activeAnimation = animations[animationType];

    const modalContent = (
        <>
            {isOpen && (
                <div 
                    className={cn(
                        "fixed inset-0 overflow-hidden pointer-events-none bg-black/35 backdrop-blur-[2px]",
                        isFullSize ? "p-0" : "p-4 flex items-center justify-center"
                    )}
                    style={{ zIndex }}
                >
                    {/* Stable backdrop handled by GlobalModals portal container */}

                    <motion.div
                        ref={modalRef}
                        {...activeAnimation}
                        transition={{ duration: 0.2, ease: "circOut" }}
                        className={cn(
                            "relative z-10 bg-[var(--bg-primary)] overflow-hidden pointer-events-auto flex flex-col shadow-none",
                            isFullSize 
                                ? "w-screen h-screen max-h-none rounded-0 border-0" 
                                : "w-full max-h-[90vh] border border-black rounded-[8px]",
                            className
                        )}
                        style={{ maxWidth: isFullSize ? 'none' : maxWidth }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 h-9 w-9 border border-[var(--border-primary)] rounded-[8px] flex items-center justify-center bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all z-20"
                            >
                                <X size={20} weight="bold" />
                            </button>
                        )}
                        <div className="overflow-y-auto no-scrollbar flex-1">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );

    return modalContent;
};

export default React.memo(BaseModal);
