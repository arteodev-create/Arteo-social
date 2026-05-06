import React from 'react';
import { X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface CreatePostHeaderProps {
    onClose: () => void;
    loading: boolean;
}

const CreatePostHeader: React.FC<CreatePostHeaderProps> = ({ onClose, loading }) => {
    const { t } = useTranslation();

    const getLabel = (key: string, fallback: string) => {
        const val = t(key);
        return val === key ? fallback : val;
    };

    return (
        <div className="px-6 h-[64px] flex items-center justify-between border-b border-black bg-[var(--bg-primary)] shrink-0 relative">
            <button
                onClick={onClose}
                disabled={loading}
                className="w-9 h-9 border border-black bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-40"
                aria-label={getLabel('common.close', 'Close')}
            >
                <X size={20} weight="bold" />
            </button>

            <span className="text-[var(--text-primary)] font-black text-[16px] absolute left-1/2 -translate-x-1/2 tracking-tight">
                {getLabel('post.create.title', 'New post')}
            </span>

            <div className="w-9" />
        </div>
    );
};

export default CreatePostHeader;
