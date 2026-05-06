import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { HotEventDetailContent, HotEventTrendInfo } from '@features/hot-event';
import { searchApi } from '@features/search/api';
import { Post } from '@entities/post/model';
import { Button } from '@shared/ui';
import { Icons } from '@shared/ui';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';

const getStoredDetail = (targetQuery: string) => {
    try {
        const key = `arteo_event_detail_${targetQuery}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const HotEventDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { query } = useParams<{ query: string }>();
    const location = useLocation();
    const stateTrend = (location.state as { trend?: HotEventTrendInfo } | null)?.trend;
    const cacheKey = `arteo_event_detail_${query}`;

    const [trend, setTrend] = useState<HotEventTrendInfo | null>(() => {
        return stateTrend || getStoredDetail(query || '')?.trend || null;
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(!trend);
    const [postsLoading, setPostsLoading] = useState(posts.length === 0);
    const [analysisStep, setAnalysisStep] = useState(0);

    const analysisSteps = t('hot_event_detail.steps', { returnObjects: true }) as string[];
    const loadingLabel = analysisSteps[analysisStep] || 'Analyzing Arteo Pulse...';
    const isLoading = loading || postsLoading;

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setAnalysisStep(prev => (prev + 1) % analysisSteps.length);
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [analysisSteps.length, loading]);

    const fetchData = useCallback(async () => {
        const searchTerm = stateTrend?.title || query;
        if (!searchTerm) {
            setLoading(false);
            setPostsLoading(false);
            return;
        }

        try {
            const response = await searchApi.getTrendDetail(searchTerm);
            if (response.success && response.data) {
                const freshTrend = response.data.trend;
                const freshPosts = response.data.posts;

                if (freshTrend && freshTrend.title) {
                    setTrend(freshTrend);
                    setPosts(freshPosts);
                    localStorage.setItem(cacheKey, JSON.stringify({
                        trend: freshTrend,
                        posts: freshPosts,
                        timestamp: Date.now()
                    }));
                }
            }
        } catch (err) {
            console.error('Fetch trend detail error:', err);
        } finally {
            setLoading(false);
            setPostsLoading(false);
        }
    }, [query, stateTrend, cacheKey]);

    useEffect(() => {
        const storedData = getStoredDetail(query || '');
        if (storedData) {
            setTrend(storedData.trend);
            setLoading(false);
            setPostsLoading(true);
        } else {
            setLoading(true);
            setPostsLoading(true);
        }

        fetchData();
    }, [fetchData, query]);

    return (
        <MainLayout layoutMode="standard">
            <Helmet>
                <title>{t('titles.event_title', { title: trend?.title || query || 'News' })} | Arteo</title>
            </Helmet>

            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                <PageHeader
                    title={
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shadow-sm shrink-0">
                                <Icons.Trending size={22} weight="light" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[22px] font-black tracking-tight leading-none">{t('hot_event_detail.header_title')}</span>
                                <span className="text-[12px] text-[var(--text-muted)] font-bold mt-1">{trend?.category || 'AI Analysis Report'}</span>
                            </div>
                        </div>
                    }
                    showBackButton
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setLoading(true); setPostsLoading(true); fetchData(); }}
                        className="text-zinc-400 hover:text-[var(--text-primary)] rounded-[8px] transition-colors"
                        title={t('hot_event_detail.refresh_title')}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </Button>
                </PageHeader>

                <HotEventDetailContent
                    trend={trend}
                    posts={posts}
                    isLoading={isLoading}
                    loadingLabel={loadingLabel}
                />
            </div>
        </MainLayout>
    );
};

export default HotEventDetailPage;