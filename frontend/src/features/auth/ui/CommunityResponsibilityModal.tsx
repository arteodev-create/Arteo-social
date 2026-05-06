import React from 'react';
import { BaseModal } from '@shared/ui';
import { ShieldWarning, HandPointing } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface CommunityResponsibilityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommunityResponsibilityModal: React.FC<CommunityResponsibilityModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="400px"
            showCloseButton={true}
            className="p-8 md:p-10"
        >
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-[8px] flex items-center justify-center mb-6 animate-pulse-subtle">
                    <ShieldWarning size={40} weight="thin" className="text-[var(--text-primary)]" />
                </div>

                <h3 className="text-[20px] font-semibold text-[var(--text-primary)] mb-3">
                    {t('auth.community_modal.title')}
                </h3>

                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-6">
                    {t('auth.community_modal.description')}
                </p>

                <div className="w-full p-4 bg-[var(--bg-secondary)] rounded-[8px] flex items-start gap-3 mb-8 text-left border border-[var(--border-primary)]">
                    <HandPointing size={20} weight="thin" className="text-[var(--text-primary)] mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[12px] font-medium text-[var(--text-primary)]">
                            {t('auth.community_modal.commitment_title')}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                            {t('auth.community_modal.commitment_desc')}
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[8px] font-medium text-[14px] hover:opacity-90 transition-all active:scale-95 shadow-none shadow-black/5"
                    >
                        {t('auth.community_modal.confirm_btn')}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
                    >
                        {t('auth.back')}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CommunityResponsibilityModal;

