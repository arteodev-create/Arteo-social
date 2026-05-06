import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '@shared/ui';
import { useTranslation } from 'react-i18next';

interface PostMenuProps {
    postId: string | number;
    isOwner: boolean;
    canDelete?: boolean;
    canReport?: boolean;
    canBlock?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
    onReport?: () => void | Promise<void>;
    onBlock?: () => void | Promise<void>;
}

const PostMenu: React.FC<PostMenuProps> = ({
    postId,
    isOwner,
    canDelete = isOwner,
    canReport = true,
    canBlock = false,
    onDelete,
    onEdit,
    onReport,
    onBlock
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleAction = (action: () => void | Promise<void>) => {
        setIsOpen(false);
        void action();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-[8px] transition-colors text-zinc-400 hover:text-[var(--text-primary)]"
            >
                <Icons.Selection size={18} weight="bold" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] shadow-none overflow-hidden z-50 animate-platinum-in">
                    {isOwner || canDelete ? (
                        <div className="p-1.5">
                            {isOwner && onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction(onEdit); }}
                                    className="w-full px-4 py-2.5 rounded-[8px] text-left text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 outline-none transition-colors"
                                >
                                    <Icons.Edit size={18} weight="bold" className="text-zinc-400" />
                                    <span className="font-bold">{t('post.edit')}</span>
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAction(onDelete || (() => { })); }}
                                className="w-full px-4 py-2.5 rounded-[8px] text-left text-[14px] text-red-500 hover:bg-red-500/10 flex items-center gap-3 outline-none transition-colors"
                            >
                                <Icons.Trash size={18} weight="bold" className="text-red-400" />
                                <span className="font-bold">{t('post.delete')}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="p-1.5">
                            {canReport && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction(onReport || (() => console.log('Report', postId))); }}
                                    className="w-full px-4 py-2.5 rounded-[8px] text-left text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 outline-none transition-colors"
                                >
                                    <Icons.Flag size={18} weight="bold" className="text-zinc-400" />
                                    <span className="font-bold">{t('post.report')}</span>
                                </button>
                            )}
                            {canBlock && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction(onBlock || (() => console.log('Block user from post', postId))); }}
                                    className="w-full px-4 py-2.5 rounded-[8px] text-left text-[14px] text-red-500 hover:bg-red-500/10 flex items-center gap-3 outline-none transition-colors"
                                >
                                    <Icons.Trash size={18} weight="bold" className="text-red-400" />
                                    <span className="font-bold">{t('common.block') || 'Block'}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostMenu;
