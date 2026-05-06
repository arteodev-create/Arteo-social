import React, { useEffect, useRef, memo } from 'react';
import { MapPin } from "@phosphor-icons/react";
import { Avatar } from '@shared/ui';
import MediaGallery from '../MediaGallery';
import { useTranslation } from 'react-i18next';

interface ThreadItemProps {
    item: any;
    index: number;
    user: any;
    isActive: boolean;
    showPollCreator: boolean;
    onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onRemoveMedia: (index: number) => void;
    onRemoveGif: () => void;
    onPollOptionChange: (idx: number, val: string) => void;
    onClick: (idx: number) => void;
    textareaRef: (el: HTMLTextAreaElement | null) => void;
    onPasteMedia?: (files: File[]) => void;
    isSelfDestruct?: boolean;
}

const ThreadItem: React.FC<ThreadItemProps> = ({
    item,
    index,
    user,
    isActive,
    showPollCreator,
    onContentChange,
    onRemoveMedia,
    onRemoveGif,
    onPollOptionChange,
    onClick,
    textareaRef,
    onPasteMedia,
    isSelfDestruct = false
}) => {
    const { t } = useTranslation();
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const textarea = localRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.max(60, scrollHeight)}px`;
        }
    }, [item.content]);

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        if (e.clipboardData.files.length > 0 && onPasteMedia) {
            e.preventDefault();
            const files = Array.from(e.clipboardData.files);
            const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
            if (validFiles.length > 0) onPasteMedia(validFiles);
        }
    };

    const handleRootClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, input')) return;
        localRef.current?.focus();
        onClick(index);
    };

    const placeholder = index === 0
        ? (t('post.create.placeholder') === 'post.create.placeholder' ? 'What are you thinking?' : t('post.create.placeholder'))
        : 'Add to this thread...';

    return (
        <div
            className="flex gap-4 bg-transparent border-b border-[var(--border-primary)] pb-6 mb-6 last:mb-0 last:border-b-0"
            onClick={handleRootClick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <div className="flex flex-col items-center flex-shrink-0 w-[48px]">
                <Avatar
                    src={user?.avatar}
                    username={user?.username}
                    seed={user?.uuid}
                    size="lg"
                    className="border border-black"
                />
                <div className="w-px flex-1 bg-black my-2"></div>
            </div>

            <div className="flex-1 flex flex-col pt-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[var(--text-primary)] font-bold text-[15px] leading-tight">
                        {user?.fullName || user?.username}
                    </span>
                    <span className="text-[var(--text-muted)] font-bold text-[14px] leading-tight">
                        @{user?.username}
                    </span>
                </div>

                <div className={`relative ${isSelfDestruct ? 'p-4 border border-dashed border-black bg-[var(--bg-secondary)]' : ''}`}>
                    <textarea
                        ref={(el) => {
                            localRef.current = el;
                            textareaRef(el);
                        }}
                        value={item.content}
                        onChange={onContentChange}
                        onPaste={handlePaste}
                        onFocus={() => onClick(index)}
                        placeholder={placeholder}
                        className={`w-full bg-transparent border-none outline-none focus:ring-0 focus:shadow-none font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none leading-relaxed p-0 overflow-hidden ${isSelfDestruct ? 'text-[16px]' : 'text-[18px]'}`}
                        style={{ minHeight: '60px', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                    />

                    {item.location && (
                        <div className="flex items-center gap-1.5 mt-2 text-[var(--text-primary)] animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-[13px] font-bold bg-[var(--bg-primary)] px-2.5 py-1 border border-black flex items-center gap-1.5">
                                <MapPin size={14} weight="bold" />
                                {item.location}
                            </span>
                        </div>
                    )}

                    {item.previews?.length > 0 && (
                        <div className="mt-4">
                            <MediaGallery mediaUrls={item.previews} onRemove={onRemoveMedia} preview />
                        </div>
                    )}

                    {item.gif && (
                        <div className="mt-4">
                            <MediaGallery gifUrl={item.gif} onRemove={onRemoveGif} preview />
                        </div>
                    )}

                    {showPollCreator && isActive && item.poll && (
                        <div className="mt-4 p-5 border border-black bg-[var(--bg-secondary)]">
                            {item.poll.options.map((opt: string, idx: number) => (
                                <input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => onPollOptionChange(idx, e.target.value)}
                                    className="w-full bg-[var(--bg-primary)] border border-black px-4 py-3 mb-2 text-[15px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-[var(--bg-secondary)] transition-colors outline-none"
                                    placeholder={`Option ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(ThreadItem);
