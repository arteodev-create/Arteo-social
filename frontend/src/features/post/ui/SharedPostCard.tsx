import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { postApi } from '@features/post/api';
import { Avatar } from '@shared/ui';
import { Icons } from '@shared/ui';
import { VerificationBadge } from '@entities/verification';
import MediaGallery from './MediaGallery';
import PollDisplay from './PollDisplay';
import { LoadingSpinner } from '@shared/ui';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../../contexts/ModalContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Post } from '@entities/post/model';
import { MODAL_IDS } from '../../../constants/modalIds';
import { queryKeys } from '@shared/lib';

interface SharedPostCardProps {
    postUuid: string;
}

export const SharedPostCard: React.FC<SharedPostCardProps> = ({ postUuid }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { openModal } = useModal();
    const queryClient = useQueryClient();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isReposted, setIsReposted] = useState(false);
    const [repostCount, setRepostCount] = useState(0);
    const [showRepostMenu, setShowRepostMenu] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!post?.isEphemeral || !post?.expiresAt) return;

        const updateTimer = () => {
            const now = new Date();
            const expiry = new Date(post.expiresAt!);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft(t('post.expired', 'Expired'));
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 0) {
                setTimeLeft(`${t('post.remaining', 'Remaining')} ${hours} ${t('post.hours', 'hours')}`);
            } else {
                setTimeLeft(`${t('post.remaining', 'Remaining')} ${minutes} ${t('post.minutes', 'minutes')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [post?.isEphemeral, post?.expiresAt, t]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await postApi.getPost(postUuid);
                if (res.success && res.data) {
                    const postData = res.data;
                    setPost(postData);
                    setIsLiked(!!postData.isLiked);
                    setLikeCount(postData.stats?.likeCount || 0);
                    setIsReposted(!!postData.isReposted);
                    setRepostCount((postData.stats?.repostCount || 0) + (postData.stats?.quoteCount || 0));
                }
            } catch (error) {
                console.error('Failed to fetch shared post:', error);
            } finally {
                setLoading(false);
            }
        };

        if (postUuid) fetchPost();
    }, [postUuid]);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!post) return;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
        try {
            if (newIsLiked) await postApi.likePost(post.uuid);
            else await postApi.unlikePost(post.uuid);
            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
        } catch (error) {
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const handleRepost = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!post) return;
        const newIsReposted = !isReposted;
        const previousIsReposted = isReposted;
        const previousCount = repostCount;
        setIsReposted(newIsReposted);
        setRepostCount(prev => newIsReposted ? prev + 1 : prev - 1);
        setShowRepostMenu(false);
        try {
            const response = await postApi.toggleRepost(post.uuid);
            if (!response.success) throw new Error('Repost failed');
            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
        } catch (error) {
            setIsReposted(previousIsReposted);
            setRepostCount(previousCount);
            toast.error(t('post.repost_error'));
        }
    };

    const handleReply = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!post) return;
        openModal(MODAL_IDS.CREATE_POST, { parentPost: post });
    };

    const handleQuote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!post) return;
        setShowRepostMenu(false);
        openModal(MODAL_IDS.CREATE_POST, { quotedPost: post });
    };

    if (loading) {
        return (
            <div className="w-full max-w-[500px] bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-main)] p-8 flex items-center justify-center min-h-[200px]">
                <LoadingSpinner size="md" label="Verifying post..." />
            </div>
        );
    }

    if (!post) return null;
    const author = post.user;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/p/${post.uuid}`)}
            className="w-full max-w-[500px] cursor-pointer active:bg-[var(--bg-secondary)] transition-all group select-none relative z-[5] rounded-[var(--radius-main)]"
        >
            <div className="flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0 w-[40px]">
                    <Avatar src={author?.avatar} username={author?.username} size="md" />
                </div>

                <div className="flex-1 flex flex-col min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[15px] font-extrabold truncate tracking-tight text-[var(--text-primary)]">
                                {author?.fullName || author?.username}
                            </span>
                            <VerificationBadge
                                isVerified={author?.isVerified}
                                verificationType={author?.verificationType}
                                size={16}
                                className="shrink-0 mt-[-1px]"
                            />
                            <div className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] font-bold truncate">
                                <span>/</span>
                                <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { locale: enUS }) : t('post.just_now')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[13px] text-[var(--text-muted)] font-bold mb-2 truncate">@{author?.username}</div>
                    <div className="text-[15px] font-bold text-[var(--text-primary)] leading-snug mb-3 whitespace-pre-wrap break-words antialiased">{post.content}</div>

                    {(post.media?.length || 0) > 0 || post.gifUrl ? (
                        <div className="mb-3 rounded-[var(--radius-main)] overflow-hidden border border-[var(--border-primary)]" onClick={(e) => e.stopPropagation()}>
                            <MediaGallery mediaUrls={post.media?.map(m => m.url) || []} gifUrl={post.gifUrl} maxHeight="350px" />
                        </div>
                    ) : null}

                    {post.poll && (
                        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                            <PollDisplay poll={post.poll} onVote={async (optionId) => {}} />
                        </div>
                    )}

                    <div className="flex items-center gap-8 mt-2 relative">
                        <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all group active:scale-95 ${isLiked ? 'text-[var(--text-primary)] font-black' : 'text-[var(--text-muted)] active:text-[var(--text-primary)]'}`}>
                            <Icons.Heart size={18} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"} />
                            <span className="text-[13px] font-black">{likeCount || ''}</span>
                        </button>

                        {post.isEphemeral ? (
                            <>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Reactions are in development');
                                    }}
                                    className="text-[var(--text-muted)] active:text-[var(--text-primary)] active:bg-[var(--bg-secondary)] p-1.5 rounded-[8px] transition-all group active:scale-95"
                                >
                                    <Icons.Smiley size={20} />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info('Messages are in development');
                                    }}
                                    className="text-[var(--text-muted)] active:text-blue-500 active:bg-blue-500/10 p-1.5 rounded-[8px] transition-all group active:scale-95"
                                >
                                    <Icons.DM size={20} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleReply} className="flex items-center gap-1.5 text-[var(--text-muted)] active:text-[var(--text-primary)] transition-all group active:scale-95">
                                    <Icons.Reply size={18} />
                                    <span className="text-[13px] font-black">{post.stats?.replyCount || ''}</span>
                                </button>

                                <div className="relative">
                                    <button onClick={(e) => { e.stopPropagation(); setShowRepostMenu(!showRepostMenu); }} className={`flex items-center gap-1.5 transition-all group active:scale-95 ${isReposted ? 'text-[var(--text-primary)] font-black' : 'text-[var(--text-muted)] active:text-[var(--text-primary)]'}`}>
                                        <Icons.Repost size={18} className={isReposted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"} />
                                        <span className="text-[13px] font-black">{repostCount || ''}</span>
                                    </button>
                                    <AnimatePresence mode="wait">
                                        {showRepostMenu && (
                                            <>
                                                <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setShowRepostMenu(false); }} />
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute left-0 bottom-full mb-3 z-[110] bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[var(--radius-main)] shadow-none py-2 w-48 overflow-hidden"
                                                >
                                                    <button onClick={handleRepost} className="w-full px-4 py-3 text-left active:bg-[var(--bg-secondary)] flex items-center gap-3 text-[14px] font-extrabold text-[var(--text-primary)]">
                                                        <Icons.Repost size={16} />
                                                        {isReposted ? t('post.unrepost') : t('post.repost')}
                                                    </button>
                                                    <button onClick={handleQuote} className="w-full px-4 py-3 text-left active:bg-[var(--bg-secondary)] flex items-center gap-3 text-[14px] font-extrabold text-[var(--text-primary)]">
                                                        <Icons.Reply size={16} />
                                                        {t('post.quote')}
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}

                        {post.isEphemeral && post.expiresAt && (
                            <div className="flex items-center gap-1.5 ml-[-20px]">
                                <Icons.Timer size={20} className="text-[var(--text-muted)]" />
                                <span className="text-[13px] font-black text-[var(--text-muted)] tracking-tight pt-[1px]">
                                    {timeLeft}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


