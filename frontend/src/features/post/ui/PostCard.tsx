import { Link, useNavigate } from 'react-router-dom';
import { Post } from '@entities/post/model';
import { VerificationBadge } from '@entities/verification';
import MediaGallery from './MediaGallery';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import PostMenu from './PostMenu';
import { Avatar } from '@shared/ui';
import { Icons } from '@shared/ui';
import { RelativeTime } from '@shared/ui';
import { Text } from '@shared/ui';
import { useAuth } from '@entities/session/model';
import { useModal } from '../../../contexts/ModalContext';
import { useEffect, useMemo } from 'react';
import { cn } from '@shared/lib';
import { TooltipProvider } from '@shared/ui';
import PollDisplay from './PollDisplay';
import PostPreview from './PostPreview';
import { InteractionBar } from './InteractionBar';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { MODAL_IDS } from '../../../constants/modalIds';
import { hasCapability } from '@entities/session/model/accessControl';
import { postApi } from '../api';
import { queryKeys } from '@shared/lib';
import { civicApi } from '@features/civic/api';

interface PostCardProps {
    post: Post;
    isThreadParent?: boolean;
    isThreadChild?: boolean;
    isThreadEnd?: boolean;
    hideThreadLine?: boolean;
    isActiveDetail?: boolean;
    onDelete?: (commentId: string) => void;
    onReply?: () => void;
    onQuote?: () => void;
    isPinned?: boolean;
    canPin?: boolean;
    onPin?: () => Promise<any>;
    hideAuthor?: boolean;
    autoOpenMediaIndex?: number;
}

const LAUNCH_CORE_ONLY = true;
const getPostRouteId = (postId?: string, shortId?: string) => {
    if (shortId) return shortId;
    const compact = postId?.replace(/-/g, '');
    const tail = compact?.slice(-8);
    return tail ? `p${parseInt(tail, 16).toString(36)}` : postId;
};

const PostCard: React.FC<PostCardProps> = ({
    post,
    isThreadParent,
    isThreadChild,
    isThreadEnd,
    hideThreadLine,
    isActiveDetail,
    onDelete,
    autoOpenMediaIndex
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { openModal, openLightbox } = useModal();
    const queryClient = useQueryClient();
    const author = post.user;

    const { t } = useTranslation();
    const canDeleteAnyPost = hasCapability(user, 'post:delete:any');
    const canReportPost = !LAUNCH_CORE_ONLY && hasCapability(user, 'post:report');
    const canBlockUser = !LAUNCH_CORE_ONLY && hasCapability(user, 'user:block');


    const getDateLocale = () => enUS;

    const handleCardClick = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        const identifier = getPostRouteId(post.uuid, post.shortId);
        if (!isActiveDetail && identifier && author?.username) {
            navigate(`/${author.username}/status/${identifier}`);
        }
    };



    useEffect(() => {
        if (autoOpenMediaIndex === undefined || autoOpenMediaIndex < 0) return;
        const mediaUrls = (post.media || []).map((m: any) => m.url);
        const allMediaUrls = post.gifUrl ? [...mediaUrls, post.gifUrl] : mediaUrls;
        if (allMediaUrls.length === 0) return;
        openLightbox(allMediaUrls, autoOpenMediaIndex);
    }, [autoOpenMediaIndex, post, openLightbox]);

    // Group reactions for display
    const groupedReactions = useMemo(() => {
        if (!post.reactions) return {};
        return post.reactions.reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [post.reactions]);

    return (
        <TooltipProvider>
            <div
                onClick={handleCardClick}
                className={`flex flex-col cursor-pointer relative z-10 
                    bg-[var(--bg-primary)] border-b border-black outline-none hover:bg-[var(--bg-secondary)]
                    ${isActiveDetail ? 'py-6 px-6 md:px-8 hover:bg-[var(--bg-primary)]' : 'p-4'}`}
            >
                {post.repostUser && (
                    <div 
                        className={cn(
                            "flex items-center gap-3 mb-2",
                            isActiveDetail ? "px-0" : "ml-[56px]"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (post.repostUser?.username) navigate(`/${post.repostUser.username}`);
                        }}
                    >
                        <Icons.Repost size={14} weight="bold" className="text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
                        <span className="text-[13px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors tracking-tight">
                            {user?.username === post.repostUser.username ? t('post.you_reposted') : (post.repostUser.fullName || post.repostUser.username) + ' ' + t('post.reposted')}
                        </span>
                    </div>
                )}
                <div className={cn("flex gap-4", isActiveDetail && "flex-col gap-5")}>
                    {/* Left: Avatar Column (Horizontal in Feed, Top in Detail) */}
                    <div className={cn("flex flex-col items-center flex-shrink-0 self-stretch relative", isActiveDetail && "flex-row self-start w-full")}>
                        {isThreadChild && !isActiveDetail && !hideThreadLine && (
                            <div className="absolute top-[-30px] bottom-[calc(100%-0px)] w-px bg-black left-1/2 -translate-x-1/2 z-0" />
                        )}
                        <div className="relative z-20" onClick={(e) => { e.stopPropagation(); navigate(`/${author?.username}`); }}>
                            <Avatar 
                                src={author?.avatar} 
                                seed={author?.uuid}
                                fallback={(author && (author.fullName || author.username)) || 'User'}
                                size={isActiveDetail ? "lg" : "md"}
                                className="border border-black"
                            />
                        </div>
                        {((isThreadParent || isThreadChild) && !isThreadEnd) && !hideThreadLine && !isActiveDetail && (
                            <div className="absolute top-[40px] bottom-[-30px] w-px bg-black z-0 left-1/2 -translate-x-1/2" />
                        )}
                        {isActiveDetail && (
                            <div className="ml-4 flex flex-col justify-center min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <Text variant="h2" className="truncate cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/${author?.username}`); }}>
                                        {author?.fullName || author?.username}
                                    </Text>
                                    <VerificationBadge
                                        isVerified={author?.isVerified}
                                        verificationType={author?.verificationType}
                                        size={18}
                                    />
                                </div>
                                <Text variant="caption" color="muted" className="truncate font-bold">
                                    @{author?.username}
                                    
                                </Text>
                            </div>
                        )}

                        {isActiveDetail && (
                            <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                                <PostMenu 
                                    postId={post.uuid} 
                                    isOwner={user?.uuid === author?.uuid} 
                                    canDelete={user?.uuid === author?.uuid || canDeleteAnyPost}
                                    canReport={canReportPost}
                                    canBlock={canBlockUser && user?.uuid !== author?.uuid}
                                    onDelete={async () => {
                                        openModal(MODAL_IDS.CONFIRM, {
                                            title: t('post.delete_confirm_title'),
                                            description: t('post.delete_confirm_desc'),
                                            confirmText: t('common.delete'),
                                            variant: 'danger',
                                            onConfirm: async () => {
                                                try {
                                                    await postApi.deletePost(post.uuid);
                                                    if (onDelete) onDelete(post.uuid);
                                                    else {
                                                        queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                                        queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                                        navigate('/');
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to delete:', error);
                                                }
                                            }
                                        });
                                    }}
                                    onReport={async () => {
                                        try {
                                            await civicApi.reportPost(post.uuid);
                                            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                            queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                            toast.success(t('post.report') || 'Report submitted');
                                        } catch (error) {
                                            toast.error(t('common.error') || 'Failed to submit report');
                                        }
                                    }}
                                    onBlock={async () => {
                                        if (!author?.uuid) return;
                                        openModal(MODAL_IDS.CONFIRM, {
                                            title: t('common.block') || 'Block account?',
                                            description: t('post.block_confirm_desc') || 'You will no longer see content from this account in your main feed.',
                                            confirmText: t('common.block') || 'Block',
                                            cancelText: t('common.cancel') || 'Cancel',
                                            variant: 'danger',
                                            onConfirm: async () => {
                                                try {
                                                    await civicApi.blockUser(author.uuid);
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.suggestedUsers });
                                                    toast.success(t('common.block') || 'Account blocked');
                                                } catch (error) {
                                                    toast.error(t('common.error') || 'Failed to block account');
                                                }
                                            }
                                        });
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 relative z-10 pt-0.5">
                        {!isActiveDetail && (
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1">
                                            <Text variant={isActiveDetail ? 'h2' : 'h3'} className="truncate cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/${author?.username}`); }}>
                                                {(author && (author.fullName || author.username)) || 'User'}
                                            </Text>
                                            <VerificationBadge
                                                isVerified={author?.isVerified}
                                                verificationType={author?.verificationType}
                                                size={isActiveDetail ? 20 : 16}
                                                className="shrink-0 drop-shadow-sm mt-[-2px]"
                                            />

                                            {(post.threadTotal || 1) > 1 && (
                                                <div className={`ml-1.5 ${isActiveDetail ? 'px-2 py-1' : 'px-1.5 py-0.5'} bg-[var(--bg-primary)] border border-black flex items-center justify-center self-center shrink-0`}>
                                                    <span className={`text-[var(--text-muted)] ${isActiveDetail ? 'text-[11px]' : 'text-[10px]'} font-bold tracking-tight leading-none pt-[0.5px]`}>
                                                        {post.threadIndex}/{post.threadTotal}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 min-w-0">
                                            <Text variant="caption" color="muted" className="truncate cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); navigate(`/${author?.username}`); }}>
                                                @{author?.username || 'user'}
                                                
                                            </Text>
                                            {!isActiveDetail && (
                                                <>
                                                    <Text variant="caption" color="muted" className="shrink-0 font-bold">·</Text>
                                                    <RelativeTime date={post.createdAt} className="shrink-0 font-bold text-[var(--text-muted)]" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <PostMenu
                                        postId={post.uuid}
                                        isOwner={user?.uuid === author?.uuid}
                                        canDelete={user?.uuid === author?.uuid || canDeleteAnyPost}
                                        canReport={canReportPost}
                                        canBlock={canBlockUser && user?.uuid !== author?.uuid}
                                        onDelete={async () => {
                                            openModal(MODAL_IDS.CONFIRM, {
                                                title: t('post.delete_confirm_title'),
                                                description: t('post.delete_confirm_desc'),
                                                confirmText: t('common.delete'),
                                                variant: 'danger',
                                                onConfirm: async () => {
                                                    try {
                                                        await postApi.deletePost(post.uuid);
                                                        if (onDelete) onDelete(post.uuid);
                                                        else {
                                                            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                                            queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to delete:', error);
                                                    }
                                                }
                                            });
                                        }}
                                        onReport={async () => {
                                        try {
                                            await civicApi.reportPost(post.uuid);
                                            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                            queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                            toast.success(t('post.report') || 'Report submitted');
                                        } catch (error) {
                                            toast.error(t('common.error') || 'Failed to submit report');
                                        }
                                    }}
                                    onBlock={async () => {
                                        if (!author?.uuid) return;
                                        openModal(MODAL_IDS.CONFIRM, {
                                            title: t('common.block') || 'Block account?',
                                            description: t('post.block_confirm_desc') || 'You will no longer see content from this account in your main feed.',
                                            confirmText: t('common.block') || 'Block',
                                            cancelText: t('common.cancel') || 'Cancel',
                                            variant: 'danger',
                                            onConfirm: async () => {
                                                try {
                                                    await civicApi.blockUser(author.uuid);
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.suggestedUsers });
                                                    toast.success(t('common.block') || 'Account blocked');
                                                } catch (error) {
                                                    toast.error(t('common.error') || 'Failed to block account');
                                                }
                                            }
                                        });
                                    }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "relative flex flex-col gap-2.5 transition-all",
                            post.isEphemeral 
                                ? "p-4 border border-dashed border-black bg-[var(--bg-secondary)]" 
                                : "p-0",
                            isActiveDetail && "p-0 mt-4"
                        )}>
                            {/* The Message Bubble Tail - Only for ephemeral posts */}
                            {post.isEphemeral && (
                                <div className="absolute left-[-1px] top-[-1px] h-3 w-3 border-l border-t border-black bg-[var(--bg-secondary)]" />
                            )}

                            <div className="whitespace-pre-wrap break-words antialiased select-text">
                                <Text variant={isActiveDetail ? "h2" : "body"} className={cn("font-bold leading-relaxed", isActiveDetail ? "text-[22px]" : "text-[15px]")} color={isActiveDetail ? "primary" : "primary"}>
                                    {(((post.content || '')).split(/(@\w+)/g) || []).map((part: any, i: any) => {
                                        if (part && part.startsWith('@')) {
                                            const username = part.slice(1);
                                            return (
                                                <Link key={i} to={`/${username}`} onClick={(e) => e.stopPropagation()} className="font-bold text-[var(--text-primary)] hover:underline">
                                                    {part}
                                                </Link>
                                            );
                                        }
                                        return part;
                                    })}
                                </Text>

                                {/* REACTION DISPLAY */}
                                {Object.entries(groupedReactions).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {Object.entries(groupedReactions).map(([emoji, count]) => (
                                            <div 
                                                key={emoji} 
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2.5 py-1 border text-[13px] transition-colors",
                                                    post.myReaction === emoji 
                                                        ? "bg-black text-white border-black" 
                                                        : "bg-[var(--bg-primary)] text-[var(--text-primary)] border-black"
                                                )}
                                            >
                                                <span>{emoji}</span>
                                                {count > 1 && <span className="font-black text-[11px]">{count}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {(post.media?.length || 0) > 0 || post.gifUrl ? (
                                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                    <MediaGallery
                                        mediaUrls={post.media?.map(m => m.url) || []}
                                        gifUrl={post.gifUrl}
                                        maxHeight={isActiveDetail ? "800px" : "500px"}
                                        onMediaClick={(index: number) => {
                                            const mediaUrls = post.media?.map((m: any) => m.url) || [];
                                            const allMediaUrls = post.gifUrl ? [...mediaUrls, post.gifUrl] : mediaUrls;
                                            openLightbox(allMediaUrls, index);
                                        }}
                                    />
                                </div>
                            ) : null}

                            {post.poll && (
                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                    <PollDisplay
                                        poll={post.poll}
                                        onVote={async (optionId: string) => {
                                            try {
                                                const response = await postApi.votePoll(post.uuid, optionId);
                                                if (response.success) {
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.feed });
                                                    queryClient.invalidateQueries({ queryKey: queryKeys.post(post.uuid) });
                                                }
                                            } catch (err) { console.error(err); }
                                        }}
                                    />
                                </div>
                            )}

                            {(post.type?.toLowerCase() === 'quote' || post.originalPost) && (
                                post.originalPost ? (
                                    <div className="mt-2">
                                        <PostPreview 
                                            post={post.originalPost} 
                                            type="quote" 
                                            onClick={() => {
                                                if (post.originalPost?.user?.username) {
                                                    navigate(`/${post.originalPost.user.username}/status/${getPostRouteId(post.originalPost.uuid, post.originalPost.shortId)}`);
                                                }
                                            }} 
                                        />
                                    </div>
                                ) : post.type?.toLowerCase() === 'quote' && (
                                    <div className="mt-2 p-4 border border-black border-dashed bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[13px] font-bold">
                                        {t('post.original_content_unavailable')}
                                    </div>
                                )
                            )}
                        </div>

                        {isActiveDetail && post.createdAt && (
                            <div className="py-4 border-b border-black mb-2 px-2">
                                <span className="text-[var(--text-muted)] text-[15px] font-bold">
                                    {format(new Date(post.createdAt), 'HH:mm · dd/MM/yyyy', { locale: getDateLocale() })}
                                </span>
                            </div>
                        )}

                        <div className="px-1 mt-1">
                            <InteractionBar post={post} isActiveDetail={isActiveDetail} />
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default PostCard;
