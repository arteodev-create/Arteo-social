import React, { useState, useEffect, useCallback } from 'react';
import { Post } from '@entities/post/model';
import { postApi } from '../api';
import { useAuth } from '@entities/session/model';
import { toast } from 'sonner';
import ContentEditor, { ContentEditorData } from './ContentEditor';
import { Avatar } from '@shared/ui';
import PostCard from './PostCard';
import { Virtuoso } from 'react-virtuoso';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@shared/ui';

import { useModal } from '../../../contexts/ModalContext';
import { MODAL_IDS } from '../../../constants/modalIds';

interface CommentSectionProps {
    postId: string;
    pinnedReplyId?: string | null;
    canPin?: boolean;
    onCommentAdded?: () => void;
    onPin?: (replyUuid: string) => Promise<void>;
}

interface ThreadNode {
    id: string;
    type: 'comment' | 'input';
    data?: Post;
    parentId?: string;
    isThreadParent: boolean;
    isThreadChild: boolean;
    isThreadEnd: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, pinnedReplyId, canPin, onCommentAdded, onPin }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [comments, setComments] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const { openModal } = useModal();

    const fetchComments = useCallback(async () => {
        try {
            const { success, data } = await postApi.getComments(postId);
            if (success && data) {
                setComments(Array.isArray(data.comments) ? data.comments : []);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Flatten all threads into a single array for Virtuoso
    const flattenedNodes = React.useMemo(() => {
        const roots: Post[] = [];
        const byParentId: Record<string, Post[]> = {};

        // Ensure comments exists and is an array before iterating
        const commentList = Array.isArray(comments) ? comments : [];

        // Sort: Pinned reply first, then by date (assuming comments are already sorted by date or we re-sort)
        // Actually, we should just prioritize the pinned logic when pushing to roots

        let sortedComments = [...commentList];
        if (pinnedReplyId) {
            const pinnedIndex = sortedComments.findIndex(c => c.uuid === pinnedReplyId);
            if (pinnedIndex > -1) {
                const [pinned] = sortedComments.splice(pinnedIndex, 1);
                sortedComments.unshift(pinned);
            }
        }

        sortedComments.forEach(c => {
            const isReply = c.parentId && c.parentId !== postId;
            if (isReply) {
                const pid = c.parentId!;
                if (!byParentId[pid]) byParentId[pid] = [];
                byParentId[pid].push(c);
            } else {
                roots.push(c);
            }
        });

        const allNodes: ThreadNode[] = [];

        roots.forEach(root => {
            const threadNodes: Array<{ type: 'comment' | 'input'; data?: Post; parentId?: string }> = [];

            threadNodes.push({ type: 'comment', data: root });
            if (replyingToId === root.uuid) {
                threadNodes.push({ type: 'input', parentId: root.uuid });
            }
            const replies = byParentId[root.uuid] || [];
            replies.forEach(reply => {
                threadNodes.push({ type: 'comment', data: reply });
                if (replyingToId === reply.uuid) {
                    threadNodes.push({ type: 'input', parentId: reply.uuid });
                }
            });

            // Convert thread-specific nodes to global nodes with context
            threadNodes.forEach((node, index) => {
                const isFirst = index === 0;
                const isLast = index === threadNodes.length - 1;
                const hasUpper = !isFirst;
                const hasLower = !isLast;

                allNodes.push({
                    id: node.type === 'comment' ? `comment-${node.data!.uuid}` : `input-${node.parentId}`,
                    type: node.type,
                    data: node.data,
                    parentId: node.parentId,
                    isThreadParent: hasLower,
                    isThreadChild: hasUpper,
                    isThreadEnd: !hasLower && hasUpper
                });
            });
        });

        return allNodes;
    }, [comments, replyingToId, postId, pinnedReplyId]);

    const handleCreateComment = async (editorData: ContentEditorData, parentUuid?: string) => {
        const content = editorData.content;
        if (!content.trim() && editorData.media.length === 0 && !editorData.gif && !editorData.poll) return;

        try {
            const { success, data } = await postApi.createComment(postId, content, parentUuid, editorData.media, editorData.gif, editorData.poll, editorData.link_preview);
            if (success && data) {
                const newComment = data.comment;
                setComments(prev => {
                    const current = Array.isArray(prev) ? prev : [];
                    return [...current, newComment];
                });
                if (onCommentAdded) onCommentAdded();
                setReplyingToId(null);
            }
        } catch (error: any) {
            console.error('Failed to post comment:', error);
            const errorMessage = error.response?.data?.message || t('post.comment_error');
            toast.error(errorMessage);
        }
    };

    const handleDeleteComment = (commentUuid: string) => {
        setComments(prev => {
            const current = Array.isArray(prev) ? prev : [];
            return current.filter(c => c.uuid !== commentUuid);
        });
        if (onCommentAdded) onCommentAdded();
    };

    return (
        <div className="pt-0">

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="md" label="Loading comments..." />
                </div>
            ) : (
                <div className="space-y-0">
                    {flattenedNodes.length === 0 ? (
                        <div className="py-12 px-6 flex flex-col items-start border-b border-black">
                            <h3 className="text-[var(--text-primary)] font-black mb-1 text-[15px]">{t('post.no_comments')}</h3>
                            <p className="text-[var(--text-muted)] font-bold text-[13px]">{t('post.no_comments_desc')}</p>
                        </div>
                    ) : (
                        <Virtuoso
                            useWindowScroll
                            data={flattenedNodes}
                            increaseViewportBy={300}
                            itemContent={(index, node) => {
                                if (node.type === 'comment' && node.data) {
                                    return (
                                        <div key={node.id} className="relative">
                                            <PostCard
                                                post={node.data}
                                                isThreadParent={node.isThreadParent}
                                                isThreadChild={node.isThreadChild}
                                                isThreadEnd={node.isThreadEnd}
                                                onDelete={handleDeleteComment}
                                                onQuote={() => {
                                                    openModal(MODAL_IDS.CREATE_POST, { quotedPost: node.data });
                                                }}
                                                onReply={() => setReplyingToId(node.data!.uuid)}
                                                // Pin Props
                                                isPinned={node.data.uuid === pinnedReplyId}
                                                canPin={canPin && node.data.parentId === postId} // Only allow pinning top-level comments
                                                onPin={onPin ? () => onPin(node.data!.uuid) : undefined}
                                            />
                                        </div>
                                    );
                                } else if (node.type === 'input') {
                                    const targetComment = comments.find(c => c.uuid === node.parentId);
                                    const initialReplyValue = targetComment ? `@${targetComment.author?.username || 'user'} ` : '';

                                    return (
                                        <div key={node.id} className="relative group">
                                            <div className="flex gap-3 px-4 pt-4 pb-4 duration-200 relative border-b border-black">
                                                <div className="flex flex-col items-center flex-shrink-0 self-stretch relative">
                                                    {node.isThreadChild && (
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-5 bg-black"></div>
                                                    )}
                                                    {node.isThreadParent && (
                                                        <div className="absolute top-5 -bottom-4 left-1/2 -translate-x-1/2 w-px bg-black"></div>
                                                    )}
                                                    <Avatar 
                                                        src={user?.avatar} 
                                                        username={user?.username} 
                                                        seed={user?.uuid}
                                                        size="md"
                                                        shape="circle"
                                                        className="z-10 border border-black"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <ContentEditor
                                                        onSubmit={(data: ContentEditorData) => handleCreateComment(data, node.parentId)}
                                                        placeholder={t('post.reply_placeholder', { username: targetComment?.author?.username || '' })}
                                                        initialValue={initialReplyValue}
                                                        autoFocus={true}
                                                        onCancel={() => setReplyingToId(null)}
                                                        submitButtonLabel={t('post.reply_submit')}
                                                        minHeight="60px"
                                                        className="!px-0"
                                                        showAvatar={false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    )}
                </div>
            )}

        </div>
    );
};

export default CommentSection;
