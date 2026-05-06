import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '@entities/post/model';
import { useTranslation } from 'react-i18next';
import MediaGallery from './MediaGallery';
import { Avatar } from '@shared/ui';
import { VerificationBadge } from '@entities/verification';
import { Text } from '@shared/ui';

const getPostRouteId = (postId?: string, shortId?: string) => {
    if (shortId) return shortId;
    const compact = postId?.replace(/-/g, '');
    const tail = compact?.slice(-8);
    return tail ? `p${parseInt(tail, 16).toString(36)}` : postId;
};

interface PostPreviewProps {
    post: Post;
    onClick?: () => void;
    type?: 'quote' | 'thread';
    depth?: number;
    rootPostUuid?: string;
}

/**
 * PostPreview Component
 * A premium, nested visual container for displaying connected content (Quotes/Threads).
 * Standardized for Arteo Platinum aesthetics with recursive depth support.
 */
const PostPreview: React.FC<PostPreviewProps> = ({ post, onClick, type = 'quote', depth = 1, rootPostUuid }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const author = post.user || post.author;
    const finalRootUuid = rootPostUuid || post.uuid;

    // Truncate logic for previews to maintain vertical hierarchy
    const displayContent = post.content?.length > 280 
        ? `${post.content.substring(0, 277)}...` 
        : post.content;

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            className={`mt-2 border border-black overflow-hidden bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-colors shadow-none relative group/preview outline-none ${type === 'thread' ? 'border-l-4 border-l-black' : ''}`}
        >
            <div className="p-5 pb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Avatar 
                        src={author?.avatar} 
                        username={author?.username} 
                        size="xs" 
                    />
                    <div className="flex items-center gap-1 min-w-0">
                        <Text variant="h3" className="truncate tracking-tight text-[15px] font-extrabold">
                            {author?.fullName || author?.username}
                        </Text>
                        <VerificationBadge isVerified={author?.isVerified} verificationType={author?.verificationType} size={14} />
                        <Text variant="caption" color="muted" className="truncate font-bold text-[13px]">@{author?.username}</Text>
                    </div>
                </div>

                {post.content && (
                    <Text variant="body" className="text-[15px] mb-3 leading-relaxed font-bold text-[var(--text-primary)]">
                        {displayContent}
                    </Text>
                )}

                {/* Recursive Nesting Logic */}
                {type === 'thread' && post.threadChild && depth < 5 && (
                    <div className="mt-1">
                        <PostPreview 
                            post={post.threadChild} 
                            type="thread" 
                            depth={depth + 1} 
                            rootPostUuid={finalRootUuid}
                            onClick={() => {
                                if (post.threadChild?.user?.username) {
                                    navigate(`/${post.threadChild.user.username}/status/${getPostRouteId(post.threadChild.uuid, post.threadChild.shortId)}`);
                                }
                            }}
                        />
                    </div>
                )}

                {/* Show More Button - When max depth reached */}
                {type === 'thread' && post.threadChild && depth === 5 && (
                    <div className="mt-3 relative">
                        <div className="absolute inset-x-0 bottom-full h-8 bg-[var(--bg-primary)] pointer-events-none" />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (author?.username) {
                                    navigate(`/${author.username}/status/${getPostRouteId(finalRootUuid, post.shortId)}`);
                                }
                            }}
                            className="w-full py-2.5 px-4 bg-[var(--bg-primary)] text-[var(--text-primary)] font-extrabold text-[13px] border border-black transition-colors flex items-center justify-center gap-2 group/btn outline-none hover:bg-[var(--bg-secondary)]"
                        >
                            <span>
                                {t('post.view_full_thread')}
                            </span>
                            <div className="w-1.5 h-1.5 bg-black transition-colors" />
                        </button>
                    </div>
                )}

                {(post.media?.length || 0) > 0 || post.gifUrl ? (
                    <div className="mt-2 overflow-hidden border border-black pointer-events-none transition-opacity">
                        <MediaGallery 
                            mediaUrls={post.media?.map(m => m.url) || []} 
                            gifUrl={post.gifUrl}
                            maxHeight="150px"
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PostPreview;
