import React, { Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../contexts/ModalContext';
import { ModalRegistry } from '../../registry/ModalRegistry';
import Lightbox from './Lightbox';
import { useDesignSystem } from './DesignSystemProvider';
import { cn } from '@shared/lib';

/**
 * GlobalModals: The dynamic rendering bridge for the AUMF.
 * It listens to the ModalContext and renders the active component from the Registry.
 * Wraps everything in Suspense to handle lazy-loaded modal components.
 */
const GlobalModals: React.FC = () => {
    const { modalStack, closeModal, lightbox, closeLightbox } = useModal();
    const { modalSize } = useDesignSystem();
    const isFullSize = modalSize === 'full';

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="global-modal-portal">
            {modalStack.length > 0 && (
                <div 
                    className={cn(
                        "fixed inset-0 pointer-events-auto transition-colors duration-300",
                        isFullSize ? "bg-[var(--bg-primary)]" : "bg-black/80"
                    )}
                    onClick={closeModal}
                    style={{ WebkitTapHighlightColor: 'transparent', zIndex: 1000 }}
                />
            )}
            {modalStack.map((modal, index) => {
                const ModalComponent = ModalRegistry[modal.id as keyof typeof ModalRegistry] as React.ComponentType<any>;
                if (!ModalComponent) return null;

                return (
                    <Suspense key={`${modal.id}-${index}`} fallback={null}>
                        <ModalComponent 
                            isOpen={true} 
                            onClose={closeModal} 
                            zIndex={2000 + (index * 100)}
                            {...modal.props} 
                        />
                    </Suspense>
                );
            })}

            <Lightbox 
                isOpen={lightbox.isOpen} 
                onClose={closeLightbox} 
                mediaUrls={lightbox.mediaUrls}
                initialIndex={lightbox.initialIndex}
            />
        </div>,
        document.body
    );
};

export default GlobalModals;

