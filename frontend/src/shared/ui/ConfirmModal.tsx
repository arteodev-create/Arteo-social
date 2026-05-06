import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@shared/lib';

export interface ConfirmAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'cancel';
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    actions: ConfirmAction[];
}

/**
 * Arteo Platinum Action Sheet Modal
 * Inspired by Image 2 - Minimalist, high-radius, clean dividers.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    actions 
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    {/* Backdrop with subtle blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
                    />
                    
                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-[360px] bg-[var(--bg-primary)] rounded-[8px] overflow-hidden shadow-none border border-black"
                    >
                        {/* Header Section */}
                        <div className="p-6 pb-5 flex flex-col items-start text-left border-b border-[var(--border-primary)]">
                            <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight mb-2 leading-tight">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-[14px] font-medium text-[var(--text-muted)] leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Actions List */}
                        <div className="flex flex-col">
                            {actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        action.onClick();
                                        onClose();
                                    }}
                                    className={cn(
                                        "w-full px-5 py-4 text-[15px] border-t border-[var(--border-primary)] transition-colors flex items-center justify-between active:bg-[var(--bg-secondary)]",
                                        action.variant === 'danger' ? 'text-rose-500 font-bold' : 
                                        action.variant === 'primary' ? 'text-[var(--text-primary)] font-bold' : 
                                        'text-zinc-500 font-medium',
                                        "hover:bg-[var(--bg-secondary)]"
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                            
                            {/* Standard Cancel Button */}
                            <button
                                onClick={onClose}
                                className="w-full px-5 py-4 text-[15px] border-t border-[var(--border-primary)] text-zinc-500 font-bold hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-secondary)] transition-colors text-left"
                            >Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
