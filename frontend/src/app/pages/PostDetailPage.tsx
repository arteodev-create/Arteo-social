import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePostDetail } from '@features/post/model';
import { PostDetailContent } from '@features/post';
import { SEO } from '@shared/ui';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';

const PostDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, isLoading, error: queryError } = usePostDetail(id);

    return (
        <MainLayout layoutMode="standard">
            {post && (
                <SEO
                    title={t('titles.post_title', {
                        name: (post.user?.fullName || post.user?.username) || 'Arteo',
                        preview: post.content?.substring(0, 60) || ''
                    })}
                    description={post.content}
                    image={post.media?.[0]?.url}
                />
            )}

            <PageHeader
                title={isLoading ? t('post.loading') : t('titles.post')}
                showBackButton={true}
                onBackClick={() => navigate(-1)}
                size="small"
            />

            <PostDetailContent
                post={post}
                isLoading={isLoading}
                hasError={!!queryError}
                notFoundTitle={t('post.not_found')}
                notFoundMessage={t('post.not_found_desc')}
            />
        </MainLayout>
    );
};

export default PostDetailPage;
