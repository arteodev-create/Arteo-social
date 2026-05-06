import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { X, MapPin } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@entities/session/model';
import { searchApi } from '@features/search/api';
import { postApi } from '../api';
import { Post, CreatePostData } from '@entities/post/model';
import { User } from '@entities/user/model';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Avatar, BaseModal, LoadingSpinner, useDesignSystem } from '@shared/ui';
import { cn } from '@shared/lib';
import { MODAL_IDS } from '../../../constants/modalIds';
import { useModal } from '../../../contexts/ModalContext';
import { queryKeys } from '@shared/lib';

// Modular Sub-components
import CreatePostHeader from './create-post/CreatePostHeader';
import ThreadItem from './create-post/ThreadItem';
import CreatePostToolbar from './create-post/CreatePostToolbar';
import QuotedPostPreview from './create-post/QuotedPostPreview';
import { EmojiClickData, Theme } from 'emoji-picker-react';
import { LocationPicker, type LocationResult } from '@shared/ui';
const EmojiPicker = React.lazy(() => import('emoji-picker-react'));

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: (post: Post) => void;
    quotedPost?: Post | null;
    initialImage?: File | null;
    initialContent?: string;
    initialLinkPreview?: any;
    parentId?: string | number;
    parentPost?: Post | null;
    zIndex?: number;
    onSuccess?: (post: Post) => void;
}

interface ThreadItemData {
    id: string;
    content: string;
    media: File[];
    previews: string[];
    poll?: { question: string; options: string[]; durationHours: number };
    gif?: string;
    linkPreview?: any;
    location?: string;
}

export default function CreatePostModal({
    isOpen,
    onClose,
    onPostCreated,
    quotedPost,
    initialImage,
    initialContent = '',
    initialLinkPreview,
    parentId,
    parentPost,
    zIndex,
    onSuccess
}: CreatePostModalProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { openModal } = useModal();
    const { modalSize } = useDesignSystem();
    const isFullSize = modalSize === 'full';

    // Thread State
    const [threadItems, setThreadItems] = useState<ThreadItemData[]>([{
        id: Date.now().toString(),
        content: initialContent || '',
        media: [],
        previews: [],
        linkPreview: initialLinkPreview || null,
    }]);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeItem = threadItems[activeIndex] || { content: '', media: [], previews: [] };

    const [loading, setLoading] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
    const [showLocationResults, setShowLocationResults] = useState(false);

    const [replySettings] = useState<'everyone' | 'following' | 'mentioned'>('everyone');
    const [visibility] = useState<'public' | 'followers' | 'mentioned'>('public');

    const [, setShowSuggestions] = useState(false);
    const [, setSuggestions] = useState<User[]>([]);

    const [isSelfDestruct, setIsSelfDestruct] = useState(false);
    const [topic] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
    const giphyFetch = new GiphyFetch('5fDQ4V4Gi641aB9uJJneSHYrpv0TKszp');

    const updateActiveItem = React.useCallback((updates: Partial<ThreadItemData>) => {
        setThreadItems(prev => {
            const newItems = [...prev];
            newItems[activeIndex] = { ...newItems[activeIndex], ...updates };
            return newItems;
        });
    }, [activeIndex]);

    const updateItem = (index: number, updates: Partial<ThreadItemData>) => {
        setThreadItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], ...updates };
            return newItems;
        });
    };

    useEffect(() => {
        if (isOpen && threadItems.length === 1) {
            textareaRefs.current[0]?.focus();
        }
    }, [isOpen, threadItems.length]);

    useEffect(() => {
        if (initialImage) {
            updateItem(0, {
                media: [initialImage],
                previews: [`${URL.createObjectURL(initialImage)}#${initialImage.type}`]
            });
        }
    }, [initialImage]);

    const handleAddThreadItem = () => {
        const newItem: ThreadItemData = {
            id: Date.now().toString(),
            content: '',
            media: [],
            previews: [],
            linkPreview: null
        };
        const newIndex = threadItems.length;
        setThreadItems(prev => [...prev, newItem]);
        setActiveIndex(newIndex);
        
        // Focus the newly rendered thread.
        setTimeout(() => {
            textareaRefs.current[newIndex]?.focus();
        }, 50);
    };


    const handleContentChange = React.useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        updateActiveItem({ content: newContent });

        // Detect mention
        const pos = e.target.selectionStart;
        const lastAtIndex = newContent.lastIndexOf('@', pos - 1);
        if (lastAtIndex !== -1) {
            const query = newContent.substring(lastAtIndex + 1, pos);
            if (!query.includes(' ') && !query.includes('\n')) {
                setShowSuggestions(true);
                try {
                    const response = await searchApi.searchUsers(query);
                    if (response.data && response.data.users) {
                        setSuggestions(response.data.users);
                    }
                } catch (error) {
                    console.error('Error searching users:', error);
                }
                return;
            }
        }
        setShowSuggestions(false);
    }, [updateActiveItem]);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            
            // Majestic Check: Limit to 100MB per file to match backend
            const MAX_SIZE = 100 * 1024 * 1024;
            const oversizedFile = files.find(f => f.size > MAX_SIZE);
            if (oversizedFile) {
                alert(`File "${oversizedFile.name}" is too large. Maximum size is 100MB.`);
                return;
            }

            if (activeItem.media.length + files.length > 4) return;

            const newMedia = [...activeItem.media, ...files];
            const newPreviews = files.map(file => `${URL.createObjectURL(file)}#${file.type}`);

            updateActiveItem({
                media: newMedia,
                previews: [...activeItem.previews, ...newPreviews]
            });
        }
    };

    const removeMedia = (index: number) => {
        const newMedia = [...activeItem.media];
        newMedia.splice(index, 1);
        const newPreviews = [...activeItem.previews];
        if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index].split('#')[0]);
        newPreviews.splice(index, 1);
        updateActiveItem({ media: newMedia, previews: newPreviews });
    };

    const togglePollCreator = () => {
        setShowPollCreator(!showPollCreator);
        if (!showPollCreator) {
            updateActiveItem({
                poll: { question: activeItem.content, options: ['Option 1', 'Option 2'], durationHours: 24 },
                media: [], previews: [], gif: undefined
            });
        } else {
            updateActiveItem({ poll: undefined });
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const textarea = textareaRefs.current[activeIndex];
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = activeItem.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newContent = before + emojiData.emoji + after;

        updateActiveItem({ content: newContent });
        setShowEmojiPicker(false);

        // Place the cursor after the inserted emoji.
        setTimeout(() => {
            textarea.focus();
            const newPos = start + emojiData.emoji.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleGifClick = (gif: any, e: any) => {
        e?.preventDefault();
        e?.stopPropagation();
        updateActiveItem({
            gif: gif.images.original.url,
            media: [], previews: [], poll: undefined
        });
        setShowGifPicker(false);
    };

    const handleLocationSelect = (res: LocationResult | null) => {
        updateActiveItem({ location: res ? res.shortName : undefined });
        setShowLocationResults(false);
        if (res) setShowLocationPicker(false);
    };

    const handleLocationResultsFetch = (results: LocationResult[]) => {
        setLocationResults(results);
        setShowLocationResults(results.length > 0);
    };

    const handleSubmit = async () => {
        if (loading) return;
        const hasContent = threadItems.some(item => item.content.trim() || (item.media && item.media.length > 0) || item.gif || item.poll);
        if (!hasContent) return;

        setLoading(true);
        try {
            let previousPostUuid = quotedPost?.uuid;
            let lastCreatedPost: Post | null = null;

            for (let i = 0; i < threadItems.length; i++) {
                const item = threadItems[i];
                const postData: CreatePostData = {
                    content: item.content,
                    media: item.media,
                    poll: item.poll ? {
                        question: item.poll.question?.trim() || item.content.trim() || 'Poll',
                        options: item.poll.options.filter(o => o.trim()),
                        durationHours: Number(item.poll.durationHours)
                    } : undefined,
                    gifUrl: item.gif,
                    replySettings,
                    visibility,
                    linkPreview: item.linkPreview,
                    originalPostId: (i === 0 && quotedPost) ? quotedPost.uuid : undefined,
                    parentId: (i === 0 && (parentPost?.uuid || parentId)) ? String(parentPost?.uuid || parentId) : ((i > 0) ? String(previousPostUuid) : undefined),
                    isEphemeral: isSelfDestruct,
                    location: item.location,
                    type: (i === 0) ? ((parentPost || parentId) ? 'reply' : (quotedPost ? 'quote' : (threadItems.length > 1 ? 'thread' : 'post'))) : 'reply',
                    topic: topic || undefined,
                    threadIndex: i + 1,
                    threadTotal: threadItems.length
                };

                const response = await postApi.createPost(postData);
                if (response.success && response.data) {
                    const newPost = (response.data as any).post || response.data;
                    lastCreatedPost = newPost;
                    previousPostUuid = newPost.uuid;
                }
            }

            if (onPostCreated && lastCreatedPost) onPostCreated(lastCreatedPost);
            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
            queryClient.invalidateQueries({ queryKey: ['user-posts'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            onClose();
        } catch (error) {
            console.error('Post creation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = React.useCallback(() => {
        const hasContent = threadItems.some(item =>
            item.content.trim().length > 0 || (item.media && item.media.length > 0) || item.poll !== undefined || item.gif !== undefined
        );

        if (hasContent) {
            openModal(MODAL_IDS.CONFIRM, {
                title: 'Save draft?',
                description: 'Do you want to keep this post draft for later?',
                actions: [
                    {
                        label: 'Save now',
                        variant: 'primary',
                        onClick: () => {
                            onClose();
                        }
                    },
                    {
                        label: 'Discard',
                        variant: 'danger',
                        onClick: () => {
                            const id = (parentPost?.uuid || parentId || 'new');
                            localStorage.removeItem(`algorithm_draft_${id}`);
                            onClose();
                        }
                    },
                    {
                        label: 'Keep writing',
                        variant: 'cancel',
                        onClick: () => {
                            // Do nothing, will stay in editor
                        }
                    }
                ]
            });
        } else {
            onClose();
        }
    }, [threadItems, onClose, openModal, parentPost, parentId]);

    const handleThreadClick = React.useCallback((idx: number) => {
        setActiveIndex(prev => {
            if (prev !== idx) return idx;
            return prev;
        });
    }, []);

    const handlePollOptionChange = React.useCallback((idx: number, val: string) => {
        if (!activeItem.poll) return;
        const options = [...activeItem.poll.options];
        options[idx] = val;
        updateActiveItem({ poll: { ...activeItem.poll, options } });
    }, [activeItem.poll, updateActiveItem]);

    const canSubmit = threadItems.some(item => item.content.trim() || (item.media && item.media.length > 0) || item.gif || item.poll);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            zIndex={zIndex}
            maxWidth={isFullSize ? 'none' : "620px"}
            closeOnOutsideClick={!loading}
            backdropStyle="dim"
            animationType="fadeScale"
            className={cn(
                "flex flex-col overflow-hidden border-black",
                isFullSize ? "h-full max-h-none" : "h-fit max-h-[90vh]"
            )}
        >

            <CreatePostHeader
                onClose={handleClose}
                loading={loading}
            />

            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-[var(--bg-primary)] md:px-8">
                {parentPost && (
                    <div className="flex gap-4 relative mb-6 border-b border-black pb-6">
                        <div className="flex flex-col items-center w-[40px] flex-shrink-0">
                            <Avatar src={parentPost.user?.avatar} username={parentPost.user?.username} size="md" />
                            <div className="w-px flex-1 bg-black my-2"></div>
                        </div>
                        <div className="flex-1 pb-2">
                            <div className="font-bold text-[var(--text-primary)] text-[15px]">@{parentPost.user?.username}</div>
                            <div className="text-[var(--text-muted)] font-bold text-[15px] line-clamp-3">{parentPost.content}</div>
                        </div>
                    </div>
                )}

                {threadItems.map((item, index) => (
                    <div key={item.id}>
                        <ThreadItem
                            item={item}
                            index={index}
                            user={user}
                            isActive={index === activeIndex}
                            showPollCreator={showPollCreator}
                            onContentChange={handleContentChange}
                            onRemoveMedia={removeMedia}
                            onRemoveGif={() => updateActiveItem({ gif: undefined })}
                            onPollOptionChange={handlePollOptionChange}
                            onClick={handleThreadClick}
                            textareaRef={(el) => { textareaRefs.current[index] = el }}
                            onPasteMedia={(files) => {
                                if (activeItem.media.length + files.length > 4) {
                                    alert(t('post.create.media_limit_reached') || 'Maximum 4 media files.');
                                    return;
                                }
                                const newMedia = [...activeItem.media, ...files];
                                const newPreviews = files.map(file => `${URL.createObjectURL(file)}#${file.type}`);
                                updateActiveItem({
                                    media: newMedia,
                                    previews: [...activeItem.previews, ...newPreviews]
                                });
                            }}
                        />
                        {index === 0 && quotedPost && (
                            <div className="ml-14 mb-8">
                                <QuotedPostPreview post={quotedPost} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <CreatePostToolbar
                onImageClick={() => fileInputRef.current?.click()}
                onGifClick={() => setShowGifPicker(true)}
                onPollClick={togglePollCreator}
                onEmojiClick={() => setShowEmojiPicker(true)}
                onLocationClick={() => setShowLocationPicker(!showLocationPicker)}
                onSelfDestructClick={() => setIsSelfDestruct(!isSelfDestruct)}
                isSelfDestruct={isSelfDestruct}
                showAddThread={activeIndex === threadItems.length - 1 && !!activeItem.content.trim()}
                onAddThread={handleAddThreadItem}
                onSubmit={handleSubmit}
                loading={loading}
                canSubmit={canSubmit}
            />

            {showLocationPicker && (
                <div className="px-6 pb-6 bg-[var(--bg-primary)] md:px-8">
                    <LocationPicker 
                        onChange={handleLocationSelect}
                        onResultsFetch={handleLocationResultsFetch}
                        variant="default"
                    />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
            />

            <AnimatePresence>
                {showGifPicker && (
                    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[var(--bg-primary)]/20" onClick={() => setShowGifPicker(false)} />
                        <div className="relative bg-[var(--bg-primary)] w-full max-w-[340px] h-[420px] overflow-hidden flex flex-col border border-black">
                            <div className="p-5 border-b border-black flex justify-between items-center bg-[var(--bg-primary)]">
                                <span className="font-black text-[var(--text-primary)]">Choose GIF</span>
                                <button onClick={() => setShowGifPicker(false)} className="h-9 w-9 border border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center"><X size={20} weight="bold" /></button>
                            </div>
                            <div 
                                className="flex-1 overflow-y-auto p-3 giphy-no-link"
                                onClickCapture={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.closest('a')) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                <Grid 
                                    width={310} 
                                    columns={2} 
                                    fetchGifs={(offset) => giphyFetch.trending({ offset, limit: 10 })} 
                                    onGifClick={handleGifClick}
                                    noLink={true}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {showEmojiPicker && (
                    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/20" onClick={() => setShowEmojiPicker(false)} />
                        <div className="relative z-10 border border-black bg-[var(--bg-primary)] shadow-none animate-in fade-in zoom-in-95 duration-200">
                            <Suspense fallback={<div className="w-[350px] h-[450px] bg-[var(--bg-primary)] flex items-center justify-center border border-black"><LoadingSpinner size="md" /></div>}>
                                <EmojiPicker 
                                    onEmojiClick={handleEmojiClick} 
                                    theme={Theme.DARK} 
                                    width={350} 
                                    height={450}
                                    lazyLoadEmojis={true}
                                />
                            </Suspense>
                        </div>
                    </div>
                )}
                {showLocationResults && (
                    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/20" onClick={() => setShowLocationResults(false)} />
                        <div className="relative bg-[var(--bg-primary)] w-full max-w-[340px] overflow-hidden flex flex-col border border-black shadow-none animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-black flex justify-between items-center bg-[var(--bg-primary)]">
                                <span className="font-black text-[var(--text-primary)]">Choose location</span>
                                <button onClick={() => setShowLocationResults(false)} className="h-9 w-9 border border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center"><X size={20} weight="bold" /></button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {locationResults.map((result, i) => (
                                    <button
                                        key={result.placeId}
                                        onClick={() => handleLocationSelect(result)}
                                        className={`w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-colors ${i !== locationResults.length - 1 ? 'border-b border-[var(--border-primary)]' : ''}`}
                                    >
                                        <MapPin size={20} className="text-[var(--text-muted)] shrink-0" weight="bold" />
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-bold text-[var(--text-primary)] truncate">{result.shortName}</p>
                                            <p className="text-[11px] font-bold text-[var(--text-muted)] truncate">{result.displayName.split(',').slice(0, 4).join(',')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </BaseModal>
    );
}
