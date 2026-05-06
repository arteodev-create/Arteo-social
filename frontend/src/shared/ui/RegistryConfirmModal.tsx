import React from 'react';
import { useModal } from '../../contexts/ModalContext';
import { cn } from '@shared/lib';

interface ConfirmAction {
    label: string;
    onClick: (e?: React.MouseEvent) => void;
    variant?: 'danger' | 'primary' | 'cancel';
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    zIndex?: number;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: 'danger' | 'primary' | 'success';
    actions?: ConfirmAction[];
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    zIndex = 2000,
    title,
    description = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'primary',
    actions
}) => {
    const { closeModal } = useModal();

    if (!isOpen) return null;

    const handleConfirm = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (onConfirm) onConfirm();
        closeModal();
    };

    const handleCancel = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (onCancel) onCancel();
        closeModal();
    };

    const modalActions: ConfirmAction[] = actions || [
        { label: confirmText, onClick: handleConfirm, variant: variant === 'danger' ? 'danger' : 'primary' },
        { label: cancelText, onClick: handleCancel, variant: 'cancel' }
    ];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center px-4 pointer-events-auto"
            style={{ zIndex }}
        >
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            <div className="relative w-full max-w-[320px] bg-[var(--bg-primary)] rounded-[8px] overflow-hidden shadow-none border border-black">
                <div className="p-8 pb-6 flex flex-col items-center text-center">
                    <h2 className="text-[18px] font-bold text-[var(--text-primary)] tracking-tight mb-2 leading-tight">
                        {title}
                    </h2>
                    <p className="text-[14px] font-medium text-[var(--text-muted)] leading-relaxed px-2">
                        {description}
                    </p>
                </div>

                <div className="flex flex-col">
                    {modalActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(e);
                                onClose();
                            }}
                            className={cn(
                                "w-full py-4 text-[16px] border-t border-[var(--border-primary)] transition-colors flex items-center justify-center active:bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]/30",
                                action.variant === 'danger' ? 'text-rose-500 font-bold' :
                                action.variant === 'primary' ? 'text-[var(--text-primary)] font-bold' :
                                'text-[var(--text-muted)] font-bold'
                            )}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
