import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PostCard } from '@features/post';
import { Post } from '@entities/post/model';
import { EmptyState } from '@shared/ui';
import { EMPTY_STATE_CODES } from '@constants/emptyStates';
import { LoadingSpinner } from '@shared/ui';

export interface HotEventTrendInfo {
    title: string;
    summary: string;
    category?: string;
    post_count?: string;
    status?: string;
}

interface HotEventDetailContentProps {
    trend: HotEventTrendInfo | null;
    posts: Post[];
    isLoading: boolean;
    loadingLabel: string;
}

const HotEventDetailContent: React.FC<HotEventDetailContentProps> = ({
    trend,
    posts,
    isLoading,
    loadingLabel
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
                <LoadingSpinner size="lg" label={loadingLabel} />
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="px-8 py-12 space-y-8">
                <div className="flex items-center gap-3 text-[11px] font-bold tracking-tight">
                    <span className="px-3 py-1 bg-[var(--text-primary)] text-[var(--bg-primary)] shrink-0 rounded-[8px]">{t('hot_event_detail.ai_report_label')}</span>
                    {trend?.post_count && (
                        <span className="text-zinc-400">{t('hot_event_detail.discussions_count', { count: parseInt(trend.post_count, 10) || 0 })}</span>
                    )}
                </div>

                <h2 className="text-[32px] md:text-[42px] font-bold tracking-tighter leading-[1] text-[var(--text-primary)]">
                    {trend?.title}
                </h2>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[8px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-[var(--text-muted)] opacity-5 group-hover:opacity-10 transition-all">
                        <FileText size={80} />
                    </div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-primary)] mb-6">
                        <Sparkles size={14} />
                        <span>{t('hot_event_detail.summary_title')}</span>
                    </div>
                    <p className="text-[17px] text-[var(--text-primary)] font-medium leading-relaxed relative z-10 text-readable">
                        {trend?.summary}
                    </p>
                    <div className="mt-8 pt-6 border-t border-[var(--border-primary)] flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400 font-bold">{t('hot_event_detail.source_label')}</span>
                        <span className="text-[11px] text-zinc-400 font-bold">{t('hot_event_detail.status_active')}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="px-8 py-6 border-y border-[var(--border-primary)] bg-[var(--bg-secondary)]/20">
                    <h3 className="text-[12px] font-bold text-zinc-400">{t('hot_event_detail.related_posts')}</h3>
                </div>

                <div className="flex flex-col">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard key={post.uuid} post={post} />
                        ))
                    ) : (
                        <div className="py-24">
                            <EmptyState
                                type={EMPTY_STATE_CODES.SEARCH_EMPTY}
                                title={t('hot_event_detail.empty_posts')}
                                description={t('hot_event_detail.empty_posts_desc')}
                                action={{
                                    label: t('hot_event_detail.explore_other'),
                                    onClick: () => navigate('/hot-events')
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotEventDetailContent;