import React from 'react';
import { Post } from '@entities/post/model';
import { Avatar } from '@shared/ui';
import { Text } from '@shared/ui';

interface QuotedPostPreviewProps {
    post: Post;
    onRemove?: () => void;
}

const QuotedPostPreview: React.FC<QuotedPostPreviewProps> = ({ post }) => {
    if (!post) return null;

    const author = post.user || post.author;

    return (
        <div className="mt-3 border border-black overflow-hidden bg-[var(--bg-primary)]">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Avatar src={author?.avatar} username={author?.username} size="xs" />
                    <span className="font-extrabold text-[14px] text-[var(--text-primary)]">
                        {author?.fullName || author?.username}
                    </span>
                    <span className="text-[var(--text-muted)] text-[14px] font-bold">@{author?.username}</span>
                </div>
                
                <Text variant="body" className="text-[15px] line-clamp-3 text-[var(--text-primary)] leading-relaxed font-bold">
                    {post.content}
                </Text>

                {post.media && post.media.length > 0 && (
                    <div className="mt-3 overflow-hidden border border-black aspect-video bg-[var(--bg-secondary)]">
                         <img 
                            src={post.media[0].url} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuotedPostPreview;
