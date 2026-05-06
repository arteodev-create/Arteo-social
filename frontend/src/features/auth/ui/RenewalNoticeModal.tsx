import React from 'react';
import { BaseModal } from '@shared/ui';
import { ShieldCheck, Info } from '@phosphor-icons/react';
import { useModal } from '../../../contexts/ModalContext';

interface RenewalNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RenewalNoticeModal: React.FC<RenewalNoticeModalProps> = ({ isOpen, onClose }) => {
    const { closeModal } = useModal();

    const handleConfirm = () => {
        if (onClose) onClose();
        closeModal();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="420px"
            className="p-8"
        >
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-[8px] flex items-center justify-center mb-6">
                    <ShieldCheck size={40} weight="fill" className="text-black" />
                </div>

                <h3 className="text-[20px] font-bold text-black mb-3 tracking-tight">
                    Session Extended For 30 Days
                </h3>

                <p className="text-[14px] text-zinc-500 leading-relaxed mb-8">
                    Arteo has renewed your session so your access stays uninterrupted for another 30 days.
                </p>

                <div className="w-full p-4 bg-zinc-50 rounded-[8px] flex items-start gap-3 mb-8 text-left">
                    <Info size={20} weight="bold" className="text-zinc-400 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-zinc-500">
                        <span className="font-bold text-black block mb-1">Security note:</span>
                        Only keep long-lived sessions enabled on devices you trust.
                    </p>
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full py-4 bg-black text-white rounded-[8px] font-bold text-[14px] hover:bg-zinc-900 transition-all active:scale-95 shadow-none shadow-black/10"
                >
                    Confirm
                </button>
            </div>
        </BaseModal>
    );
};

export default RenewalNoticeModal;
