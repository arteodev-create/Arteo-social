import React from 'react';
import { PostCard, CommentSection } from '@features/post';
import NotFound from '../ui/PostNotFound';
import { LoadingSpinner } from '@shared/ui';
import { Post } from '@entities/post/model';

interface PostDetailContentProps {
    post?: Post | null;
    isLoading: boolean;
    hasError?: boolean;
    notFoundTitle: string;
    notFoundMessage: string;
    autoOpenMediaIndex?: number;
}

const PostDetailContent: React.FC<PostDetailContentProps> = ({
    post,
    isLoading,
    hasError,
    notFoundTitle,
    notFoundMessage,
    autoOpenMediaIndex
}) => {
    if (hasError && !post && !isLoading) {
        return <NotFound title={notFoundTitle} message={notFoundMessage} />;
    }

    return (
        <div className="flex-1 w-full bg-[var(--bg-primary)]">
            {isLoading && !post ? (
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <LoadingSpinner size="lg" label="Arteo is retrieving the post..." />
                </div>
            ) : post ? (
                <>
                    <div className="animate-platinum-in border-b border-black">
                        <PostCard
                            post={post}
                            isThreadParent={post.type?.toLowerCase() === 'thread'}
                            hideThreadLine={false}
                            isActiveDetail={true}
                            autoOpenMediaIndex={autoOpenMediaIndex}
                        />
                    </div>

                    <div className="pt-0 bg-[var(--bg-primary)] min-h-[400px]">
                        <CommentSection postId={post.uuid} />
                    </div>
                </>
            ) : (
                <NotFound title={notFoundTitle} message={notFoundMessage} />
            )}
        </div>
    );
};

export default PostDetailContent;
