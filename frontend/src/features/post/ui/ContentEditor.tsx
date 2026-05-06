
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, X, User as UserIcon, Smile, BarChart2, Loader2, Film } from 'lucide-react';
import { useAuth } from '@entities/session/model';
import { searchApi } from '@features/search/api';
import { utilApi } from '@features/post/api';
import { User } from '@entities/user/model';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { parseToTwemoji } from '@shared/lib';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';

import MediaGallery from './MediaGallery';

const giphyFetch = new GiphyFetch('5fDQ4V4Gi641aB9uJJneSHYrpv0TKszp');

export interface ContentEditorData {
    content: string;
    media: File[];
    poll?: {
        question: string;
        options: string[];
        duration_hours: number;
    };
    gif?: string;
    link_preview?: any;
}

interface ContentEditorProps {
    placeholder?: string;
    initialValue?: string;
    autoFocus?: boolean;
    onSubmit: (data: ContentEditorData) => Promise<void>;
    onCancel?: () => void;
    submitButtonLabel?: string; // defaults to the localized post label or an icon
    className?: string;
    minHeight?: string;
    showAvatar?: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
    placeholder,
    initialValue = '',
    autoFocus,
    onSubmit,
    onCancel,
    submitButtonLabel,
    className,
    minHeight = '100px',
    showAvatar = true
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [content, setContent] = useState(initialValue);
    const [media, setMedia] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Mention Suggestion State
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionQuery, setSuggestionQuery] = useState('');
    const [suggestionIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Poll State
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [pollDuration, setPollDuration] = useState(24);

    // GIF State
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedGif, setSelectedGif] = useState<string | null>(null);

    // Unsaved Changes Warning
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    // Location state removed.

    // Link Preview State
    const [linkPreview, setLinkPreview] = useState<any>(null);
    const [fetchingPreview, setFetchingPreview] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const removedUrlRef = useRef<string | null>(null);
    const attemptedUrlsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
            if (initialValue) {
                textareaRef.current.setSelectionRange(initialValue.length, initialValue.length);
            }
        }
    }, [autoFocus, initialValue]);

    // Handle Mention Search
    useEffect(() => {
        const searchUsers = async () => {
            if (suggestionQuery.length > 0) {
                try {
                    const { success, data } = await searchApi.searchUsers(suggestionQuery);
                    if (success && data) {
                        const users = (data as any).users;
                        if (Array.isArray(users)) {
                            setSuggestions(users);
                        }
                    }
                } catch (error) {
                    console.error('Failed to search users:', error);
                }
            } else {
                setSuggestions([]);
            }
        };

        const timer = setTimeout(searchUsers, 200);
        return () => clearTimeout(timer);
    }, [suggestionQuery]);

    // Location search effect removed.

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [content]);

    // Link Preview
    useEffect(() => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);

        if (urls && urls.length > 0) {
            const url = urls[0];
            if (url !== linkPreview?.url && url !== removedUrlRef.current && !fetchingPreview && media.length === 0 && !selectedGif) {
                if (attemptedUrlsRef.current.has(url)) return; // Skip if already attempted

                const fetchPreview = async () => {
                    setFetchingPreview(true);
                    attemptedUrlsRef.current.add(url); // Mark as attempted
                    try {
                        const { success, data } = await utilApi.getLinkPreview(url);
                        if (success && data) {
                            setLinkPreview(data);
                            removedUrlRef.current = null;
                        }
                    } catch (error) {
                        console.error('Failed to fetch link preview:', error);
                    } finally {
                        setFetchingPreview(false);
                    }
                };
                fetchPreview();
            }
        } else if ((!urls || urls.length === 0) && linkPreview) {
            setLinkPreview(null);
            removedUrlRef.current = null;
            // Optional: attemptedUrlsRef.current.clear(); // Don't clear to avoid loop if user types same link again
        }
    }, [content, media.length, selectedGif, linkPreview, fetchingPreview]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const pos = e.target.selectionStart;
        setContent(value);
        setCursorPosition(pos);

        // Detect mention
        const lastAtIndex = value.lastIndexOf('@', pos - 1);
        if (lastAtIndex !== -1) {
            const query = value.substring(lastAtIndex + 1, pos);
            if (!query.includes(' ')) {
                setSuggestionQuery(query);
                setShowSuggestions(true);
                return;
            }
        }
        setShowSuggestions(false);
    };

    const insertMention = (username: string) => {
        const lastAtIndex = content.lastIndexOf('@', cursorPosition - 1);
        const before = content.substring(0, lastAtIndex);
        const after = content.substring(cursorPosition);
        const newContent = `${before}@${username} ${after}`;
        setContent(newContent);
        setShowSuggestions(false);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = lastAtIndex + username.length + 2;
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 10);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const before = content.substring(0, cursorPosition);
        const after = content.substring(cursorPosition);
        const newContent = before + emojiData.emoji + after;
        setContent(newContent);
        setShowEmojiPicker(false);

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = cursorPosition + emojiData.emoji.length;
                textareaRef.current.setSelectionRange(newPos, newPos);
                setCursorPosition(newPos);
            }
        }, 10);
    };

    const handleGifClick = (gif: any, e: any) => {
        e?.preventDefault();
        e?.stopPropagation();
        setSelectedGif(gif.images.original.url);
        setShowGifPicker(false);
    };

    // Location select removed.

    const renderHighlightedContent = () => {
        if (!content) return null;
        const combinedRegex = /(@\w+|#\w+|https?:\/\/[^\s]+)/g;
        return content.split(combinedRegex).map((part, i) => {
            if (part.startsWith('@') || part.startsWith('#') || part.startsWith('http')) {
                return <span key={i} className="text-[var(--app-accent)]">{part}</span>;
            }
            return <span key={i} className="text-[var(--app-text)]" dangerouslySetInnerHTML={{ __html: parseToTwemoji(part) }} />;
        });
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + media.length > 4) {
            alert(t('editor.max_media'));
            return;
        }
        const newMedia = [...media, ...files];
        setMedia(newMedia);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeMedia = (index: number) => {
        const newMedia = [...media];
        newMedia.splice(index, 1);
        setMedia(newMedia);
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    // Poll logic
    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) setPollOptions([...pollOptions, '']);
    };

    const removePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const togglePollCreator = () => {
        setShowPollCreator(!showPollCreator);
        if (!showPollCreator) {
            setPollOptions(['', '']);
            setPollDuration(24);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!content.trim() && media.length === 0 && !showPollCreator && !selectedGif) return;

        let pollData;
        if (showPollCreator) {
            const validOptions = pollOptions.filter(opt => opt.trim().length > 0);
            if (validOptions.length < 2) {
                alert(t('editor.poll_min_options'));
                return;
            }
            pollData = {
                question: content || 'Survey',
                options: validOptions,
                duration_hours: pollDuration
            };
        }

        setLoading(true);
        try {
            await onSubmit({
                content,
                media,
                poll: pollData,
                gif: selectedGif || undefined,
                link_preview: linkPreview
            });
            // Reset
            setContent('');
            setMedia([]);
            setPreviews([]);
            setPollOptions(['', '']);
            setShowPollCreator(false);
            setLinkPreview(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex gap-3 px-4 w-full ${className || ''}`}>
            {showAvatar && (
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-[8px] bg-[var(--app-border)] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[var(--app-border)] relative">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).classList.add('hidden');
                                }}
                            />
                        ) : null}
                        <div className={`avatar-fallback w-full h-full flex items-center justify-center bg-[var(--app-bg-subtle)] absolute inset-0 ${user?.avatar ? 'hidden' : ''}`}>
                            <UserIcon className="w-5 h-5 text-[var(--app-text-muted)]" />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 relative">
                {/* Editor Container */}
                <div className="relative min-h-[100px] border border-[var(--app-border)] rounded-[8px] bg-[var(--app-card-bg)] p-3 transition-all">
                    <div className="relative mb-2">
                        {/* Highlighting Layer */}
                        <div
                            className="absolute inset-0 text-[15px] leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-transparent py-0 select-none font-sans"
                            style={{ minHeight }}
                        >
                            {renderHighlightedContent()}
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onPaste={(e) => {
                                if (e.clipboardData.files.length > 0) {
                                    e.preventDefault();
                                    const files = Array.from(e.clipboardData.files);
                                    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));

                                    if (validFiles.length > 0) {
                                        if (media.length + validFiles.length > 4) {
                                            alert('Maximum 4 media files per post.');
                                            return;
                                        }
                                        const newMedia = [...media, ...validFiles];
                                        setMedia(newMedia);
                                        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                                        setPreviews([...previews, ...newPreviews]);
                                    }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleSubmit(e);
                                }
                                if (e.key === 'Escape' && onCancel) onCancel();
                            }}
                            placeholder={placeholder}
                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[15px] leading-relaxed text-transparent caret-[var(--app-text)] placeholder-[var(--app-text-muted)] resize-none p-0 relative z-10 font-sans break-words whitespace-pre-wrap"
                            style={{ minHeight }}
                        />
                    </div>

                    {/* Previews & Attachments */}
                    <MediaGallery
                        mediaUrls={previews}
                        onRemove={removeMedia}
                        preview={true}
                    />

                    {selectedGif && (
                        <div className="my-2 relative rounded-[8px] overflow-hidden border border-[var(--app-border)]">
                            <img src={selectedGif} alt="Selected GIF" className="w-full" />
                            <button onClick={() => setSelectedGif(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-[8px] hover:bg-black/80">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {/* Poll Creator */}
                    {showPollCreator && (
                        <div className="my-2 p-3 border border-[var(--app-border)] rounded-[8px] bg-[var(--app-bg)]">
                            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-[var(--app-text)]">{t('editor.create_poll')}</h3>
                                <button onClick={togglePollCreator} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                {pollOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={opt}
                                            onChange={e => handlePollOptionChange(i, e.target.value)}
                                            placeholder={t('editor.option_n', { n: i + 1 })}
                                            className="flex-1 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded px-2 py-1.5 text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none"
                                        />
                                        {pollOptions.length > 2 && <button onClick={() => removePollOption(i)} className="text-red-500"><X className="w-4 h-4" /></button>}
                                    </div>
                                ))}
                            </div>
                            {pollOptions.length < 4 && (
                                <button onClick={addPollOption} className="mt-2 text-[var(--app-accent)] text-xs font-medium hover:underline">+ {t('editor.add_option')}</button>
                            )}
                            <div className="mt-2 pt-2 border-t border-[var(--app-border)]">
                                <select value={pollDuration} onChange={e => setPollDuration(Number(e.target.value))} className="w-full bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded px-2 py-1.5 text-sm text-[var(--app-text)] outline-none">
                                    <option value={24}>{t('editor.day_1')}</option>
                                    <option value={72}>{t('editor.days_3')}</option>
                                    <option value={168}>{t('editor.days_7')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--app-border)]">
                        <div className="flex items-center gap-1">
                            <input type="file" ref={fileInputRef} onChange={handleMediaChange} multiple accept="image/*,video/*" className="hidden" />
                            {!showPollCreator && (
                                <>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-[8px] hover:bg-[var(--app-card-hover)] transition-colors"><ImageIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => setShowGifPicker(!showGifPicker)} className={`p-1.5 rounded-[8px] hover:bg-[var(--app-card-hover)] transition-colors ${showGifPicker ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-accent)]'}`}><Film className="w-5 h-5" /></button>
                                </>
                            )}
                            <div className="relative">
                                <button ref={emojiButtonRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-[8px] hover:bg-[var(--app-card-hover)] transition-colors"><Smile className="w-5 h-5" /></button>
                                {showEmojiPicker && (
                                    <>
                                        <div className="fixed inset-0 z-[120]" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[130]">
                                            <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} width={350} height={450} />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={togglePollCreator} className={`p-1.5 rounded-[8px] hover:bg-[var(--app-card-hover)] transition-colors ${showPollCreator ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-accent)]'}`}><BarChart2 className="w-5 h-5" /></button>
                        </div>

                        <div className="flex items-center gap-2">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Check if there are unsaved changes
                                        const hasUnsavedChanges = content.trim().length > 0 ||
                                            media.length > 0 ||
                                            showPollCreator ||
                                            selectedGif !== null;

                                        if (hasUnsavedChanges) {
                                            setShowCloseConfirm(true);
                                        } else {
                                            onCancel();
                                        }
                                    }}
                                    className="text-sm font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] px-3 py-1.5"
                                >
                                    {t('common.cancel')}
                                </button>
                            )}
                            <button
                                onClick={(e) => handleSubmit(e)}
                                disabled={loading || (!content.trim() && media.length === 0 && !showPollCreator && !selectedGif)}
                                className="px-4 py-1.5 bg-[var(--app-text)] text-[var(--app-bg)] rounded-[8px] text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                {submitButtonLabel || t('editor.post')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mention Dropdown - Premium Light Glassmorphism */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white/90  border border-zinc-200/50 rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                            {suggestions.map((u, i) => (
                                <button
                                    key={u.uuid}
                                    onClick={() => insertMention(u.username)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-[8px] transition-all duration-200 text-left ${i === suggestionIndex ? 'bg-zinc-100' : 'hover:bg-zinc-50'}`}
                                >
                                    <div className="w-8 h-8 rounded-[8px] bg-zinc-100 overflow-hidden ring-1 ring-zinc-200/50">
                                        {u.avatar ? (
                                            <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 m-2 text-zinc-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[14px] font-bold text-zinc-950 truncate">{u.fullName || u.username}</span>
                                        <span className="text-[12px] text-zinc-500 truncate font-medium">@{u.username}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* GIF Modal */}
                {showGifPicker && (
                    <>
                        <div className="fixed inset-0 z-[120]" onClick={() => setShowGifPicker(false)} />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[130] bg-[var(--app-bg)] rounded-[8px] border border-[var(--app-border)] w-[480px] h-[500px] overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-[var(--app-border)] flex justify-between items-center">
                                <h3 className="font-bold text-[var(--app-text)]">{t('editor.select_gif')}</h3>
                                <button onClick={() => setShowGifPicker(false)}><X className="w-5 h-5 text-[var(--app-text-muted)]" /></button>
                            </div>
                            <div 
                                className="flex-1 overflow-y-auto p-2 giphy-no-link"
                                onClickCapture={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.closest('a')) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                <Grid 
                                    width={460} 
                                    columns={3} 
                                    gutter={6} 
                                    fetchGifs={(offset) => giphyFetch.trending({ offset, limit: 10 })} 
                                    onGifClick={handleGifClick}
                                    noLink={true}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Unsaved Changes Confirmation Modal */}
                {showCloseConfirm && (
                    <div
                        className="fixed inset-0 bg-black/80  flex items-center justify-center z-[140] p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-zinc-900 border border-white/10 rounded-[8px] p-8 max-w-md w-full">
                            <h3 className="text-lg font-bold text-white mb-3">{t('editor.discard_title')}</h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                {t('editor.discard_desc')}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCloseConfirm(false);
                                        if (onCancel) onCancel();
                                    }}
                                    className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-[8px] font-bold text-sm hover:bg-red-600 transition-colors"
                                >
                                    {t('editor.discard')}
                                </button>
                                <button
                                    onClick={() => setShowCloseConfirm(false)}
                                    className="flex-1 bg-white/5 border border-white/10 text-zinc-400 px-4 py-2.5 rounded-[8px] font-medium text-sm hover:bg-white/10 transition-colors"
                                >
                                    {t('editor.keep_editing')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentEditor;

