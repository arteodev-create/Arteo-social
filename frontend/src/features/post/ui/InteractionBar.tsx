import React from 'react';
import { cn } from '@shared/lib';
import { Icons } from '@shared/ui';
import { useOptimisticInteractions } from '@features/post/model';
import { Post } from '@entities/post/model';
import { useModal } from '../../../contexts/ModalContext';
import { MODAL_IDS } from '../../../constants/modalIds';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ReactionPicker } from './ReactionPicker';
import { useSocket } from '@entities/session/model';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractionBarProps {
    post: Post;
    isActiveDetail?: boolean;
    className?: string;
}

interface FloatingIndicator {
    id: number;
    value: number;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({ 
    post, 
    isActiveDetail = false,
    className 
}) => {
    const { t } = useTranslation();
    const { openModal } = useModal();
    const socket = useSocket();
    const { react, like, repost, bookmark } = useOptimisticInteractions();

    const [timeLeft, setTimeLeft] = React.useState<string>('');
    const [floatingIndicators, setFloatingIndicators] = React.useState<FloatingIndicator[]>([]);

    // Listen for lifespan updates so the UI can show the boost animation.
    React.useEffect(() => {
        if (!socket) return;

        const handleLifespanUpdate = (payload: any) => {
            if (payload.postId === post.uuid && payload.adjustment !== 0) {
                const newIndicator = { id: Date.now(), value: payload.adjustment };
                setFloatingIndicators(prev => [...prev, newIndicator]);
                
                // Remove the visual boost after 1.5 seconds.
                setTimeout(() => {
                    setFloatingIndicators(prev => prev.filter(i => i.id !== newIndicator.id));
                }, 1500);
            }
        };

        socket.on('post_lifespan_updated', handleLifespanUpdate);
        return () => { socket.off('post_lifespan_updated', handleLifespanUpdate); };
    }, [socket, post.uuid]);

    React.useEffect(() => {
        if (!post.isEphemeral || !post.expiresAt) return;

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
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${t('post.remaining', 'Remaining')} ${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setTimeLeft(`${t('post.remaining', 'Remaining')} ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${t('post.remaining', 'Remaining')} ${seconds}s`);
            }
        };

        updateTimer();
        
        // Optimize timer cadence based on how close the post is to expiry.
        // Use 1s updates near expiry and 60s updates otherwise.
        const expiry = new Date(post.expiresAt!);
        const isExpiringSoon = (expiry.getTime() - new Date().getTime()) < 120000;
        
        const interval = setInterval(updateTimer, isExpiringSoon ? 1000 : 60000);
        return () => clearInterval(interval);
    }, [post.isEphemeral, post.expiresAt, t]);

    const [localState, setLocalState] = React.useState({
        isLiked: !!post.isLiked,
        isReposted: !!post.isReposted,
        isBookmarked: !!post.isBookmarked,
        likeCount: post.stats?.likeCount || 0,
        repostCount: (post.stats?.repostCount || 0) + (post.stats?.quoteCount || 0)
    });

    React.useEffect(() => {
        setLocalState({
            isLiked: !!post.isLiked,
            isReposted: !!post.isReposted,
            isBookmarked: !!post.isBookmarked,
            likeCount: post.stats?.likeCount || 0,
            repostCount: (post.stats?.repostCount || 0) + (post.stats?.quoteCount || 0)
        });
    }, [post.uuid, post.isLiked, post.isReposted, post.isBookmarked, post.stats?.likeCount, post.stats?.repostCount, post.stats?.quoteCount]);

    const isLiked = localState.isLiked;
    const isReposted = localState.isReposted;
    const isBookmarked = localState.isBookmarked;

    const likeCount = localState.likeCount;
    const repostCount = localState.repostCount;
    const replyCount = post.stats?.replyCount || 0;

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextLiked = !isLiked;
        setLocalState(prev => ({
            ...prev,
            isLiked: nextLiked,
            likeCount: Math.max(0, prev.likeCount + (nextLiked ? 1 : -1))
        }));
        like({ uuid: post.uuid, isLiked: !!isLiked });
    };

    const handleRepost = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextReposted = !isReposted;
        setLocalState(prev => ({
            ...prev,
            isReposted: nextReposted,
            repostCount: Math.max(0, prev.repostCount + (nextReposted ? 1 : -1))
        }));
        repost({ uuid: post.uuid, isReposted: !!isReposted });
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalState(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }));
        bookmark({ uuid: post.uuid, isBookmarked: !!isBookmarked });
    };

    const handleReply = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(MODAL_IDS.CREATE_POST, { parentPost: post });
    };

    return (
        <div 
            onClick={(e) => e.stopPropagation()}
            className={cn(
                "flex items-center gap-2 relative z-30",
                isActiveDetail ? 'mt-6 border-t border-black pt-4' : 'mt-2',
                className
            )}
        >
            {post.isEphemeral ? (
                <>
                    {/* SMILEY (EPHEMERAL) */}
                    <div className="relative">
                        <ReactionPicker 
                            onSelect={(emoji) => {
                                react({ uuid: post.uuid, emoji });
                            }}
                        >
                                <button 
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "group flex h-9 items-center gap-2 border border-black px-3 transition-colors outline-none focus:ring-0",
                                        post.myReaction 
                                            ? "text-white bg-black" 
                                            : "text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                                    )}
                                >
                                    {post.myReaction ? (
                                        <span className="text-[18px] leading-none transform group-hover:scale-125 transition-transform">{post.myReaction}</span>
                                    ) : (
                                        <Icons.Smiley size={19} weight="regular" className="group-hover:scale-110 transition-transform" />
                                    )}
                                    {post.stats?.reactionCount ? (
                                        <span className={cn(
                                            "text-[12px] font-black transition-colors",
                                            post.myReaction ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-active:text-[var(--text-primary)]"
                                        )}>
                                            {post.stats.reactionCount}
                                        </span>
                                    ) : null}
                                </button>
                        </ReactionPicker>
                    </div>

                    {/* SELF DESTRUCT TIMER WITH OXYGEN EFFECTS */}
                    {post.expiresAt && (
                        <div className="flex items-center gap-1.5 ml-2 relative">
                            <motion.div
                                animate={floatingIndicators.length > 0 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                <Icons.Timer size={16} className={cn(
                                    "transition-colors",
                                    floatingIndicators.some(i => i.value > 0) ? "text-emerald-500" : 
                                    floatingIndicators.some(i => i.value < 0) ? "text-red-500" : "text-[var(--text-muted)]"
                                )} />
                            </motion.div>
                            
                            <span className={cn(
                                "text-[12px] font-black pt-[1px] min-w-[70px] transition-colors",
                                floatingIndicators.some(i => i.value > 0) ? "text-emerald-500" : 
                                floatingIndicators.some(i => i.value < 0) ? "text-red-500" : "text-[var(--text-muted)]"
                            )}>
                                {timeLeft}
                            </span>

                            {/* FLOATING ADJUSTMENTS (+10m / -10m) */}
                            <AnimatePresence>
                                {floatingIndicators.map((indicator) => (
                                    <motion.div
                                        key={indicator.id}
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                        exit={{ opacity: 0, y: -60, scale: 1 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn(
                                            "absolute left-5 top-[-10px] font-black text-[14px] pointer-events-none whitespace-nowrap",
                                            indicator.value > 0 ? "text-emerald-500" : "text-red-500"
                                        )}
                                    >
                                        {indicator.value > 0 ? `+${indicator.value}m` : `${indicator.value}m`}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* LIKE */}
                    <button 
                        onClick={handleLike} 
                        className={cn(
                            "group flex h-9 min-w-9 items-center justify-center gap-2 border border-black px-2 transition-colors outline-none focus:ring-0",
                            'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        )}
                    >
                        <Icons.Heart 
                            size={18} 
                            weight={isLiked ? "fill" : "regular"}
                            className={cn("transition-colors", isLiked && "scale-110")} 
                        />
                        <span className="text-[12px] font-black text-[var(--text-primary)] transition-colors">{likeCount || ''}</span>
                    </button>

                    {/* REPLY */}
                    <button 
                        onClick={handleReply} 
                        className="group flex h-9 min-w-9 items-center justify-center gap-2 border border-black px-2 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors outline-none focus:ring-0"
                    >
                        <Icons.Reply size={18} weight="regular" className="group-active:scale-110 transition-transform" />
                        <span className="text-[12px] font-black group-active:text-[var(--text-primary)]">{replyCount || ''}</span>
                    </button>

                    {/* REPOST & QUOTE */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button 
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    "group flex h-9 min-w-9 items-center justify-center gap-2 border border-black px-2 transition-colors outline-none focus:ring-0",
                                    'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                                )}
                            >
                                <Icons.Repost 
                                    size={18} 
                                    weight={isReposted ? "bold" : "regular"}
                                    className={cn("transition-colors", isReposted && "scale-110")} 
                                />
                                <span className="text-[12px] font-black text-[var(--text-primary)] transition-colors">{repostCount || ''}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52 p-0 border border-black bg-[var(--bg-primary)] shadow-none animate-platinum-in">
                            <DropdownMenuItem 
                                onClick={handleRepost}
                                className="py-3.5 px-4 cursor-pointer focus:bg-[var(--bg-secondary)]"
                            >
                                <div className="flex items-center gap-3">
                                    <Icons.Repost size={18} weight={isReposted ? "bold" : "regular"} className={isReposted ? "text-emerald-500" : "text-[var(--text-muted)]"} />
                                    <span className={cn("font-bold text-[14px]", isReposted && "text-emerald-500")}>{isReposted ? t('post.unrepost') : t('post.repost')}</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(MODAL_IDS.CREATE_POST, { quotedPost: post });
                                }}
                                className="py-3.5 px-4 cursor-pointer focus:bg-[var(--bg-secondary)]"
                            >
                                <div className="flex items-center gap-3">
                                    <Icons.Quote size={18} weight="regular" className="text-[var(--text-muted)]" />
                                    <span className="font-black text-[14px] text-[var(--text-primary)]">{t('post.quote')}</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}

            {/* BOOKMARK */}
            <button 
                onClick={handleBookmark} 
                className={cn(
                    "group flex h-9 min-w-9 items-center justify-center gap-2 border border-black px-2 transition-colors outline-none focus:ring-0 ml-auto",
                    'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                )}
            >
                <Icons.PushPin 
                    size={18} 
                    weight={isBookmarked ? "fill" : "bold"}
                    className={cn("transition-transform", isBookmarked ? "scale-110 text-[var(--text-primary)]" : "group-hover:scale-110")} 
                />
            </button>

            {/* SHARE */}
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <button 
                        onClick={(e) => e.stopPropagation()}
                    className="group flex h-9 w-9 items-center justify-center border border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors outline-none focus:ring-0"
                    >
                        <Icons.Share size={17} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-0 border border-black bg-[var(--bg-primary)] shadow-none animate-platinum-in">
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation();
                            const compact = post.uuid.replace(/-/g, '');
                            const routeId = post.shortId || `p${parseInt(compact.slice(-8), 16).toString(36)}`;
                            const url = `${window.location.origin}/${post.user?.username || 'post'}/status/${routeId}`;
                            navigator.clipboard.writeText(url);
                            toast.success(t('post.link_copied'));
                        }}
                        className="py-3 px-4 cursor-pointer focus:bg-[var(--bg-secondary)]"
                    >
                        <div className="flex items-center gap-3">
                            <Icons.Link size={18} />
                            <span className="font-bold text-[14px] text-[var(--text-primary)]">{t('post.copy_link')}</span>
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="py-3 px-4 cursor-pointer focus:bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-3">
                            <Icons.Sparkles size={18} />
                            <span className="font-bold text-[14px] text-[var(--text-primary)]">{t('post.share_via')}</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
