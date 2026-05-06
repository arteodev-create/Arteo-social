import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@features/search/api';
import type { ApiResponse } from '@shared/api';
import { EmptyState } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';
import { EMPTY_STATE_CODES } from '@constants/emptyStates';
import { queryKeys } from '@shared/lib';
interface HotEvent {
    title: string;
    summary: string;
    category: string;
    post_count: string;
    hashtags: string[];
    status: string;
}

const HotEventsContent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const generateSlug = (text: string) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[\u0111\u0110]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .trim()
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNavigate = (event: HotEvent) => {
        const slug = generateSlug(event.title);
        navigate(`/hot-events/${slug}`, { state: { trend: event } });
    };

    const { data: trendsData, isLoading: loading } = useQuery<ApiResponse<any>, Error>({
        queryKey: queryKeys.hotEventsAnalysisPage,
        queryFn: () => searchApi.getHotEvents(),
        staleTime: 1000 * 60 * 5,
    });

    const rawEvents: HotEvent[] = (trendsData as any)?.data?.trending || 
                          (trendsData as any)?.data?.events ||
                          (Array.isArray((trendsData as any)?.data) ? (trendsData as any)?.data : []);
    const events = rawEvents.filter(e => e.status !== 'SYNCING' && e.title !== "Updating latest trends...");

    if (loading && !trendsData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <LoadingSpinner size="lg" label="Arteo is analyzing trends..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
            <div className="flex flex-col divide-y divide-[var(--border-primary)]/40 pb-24">
                    <AnimatePresence>
                        {events.length > 0 ? (
                            events.map((event, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => handleNavigate(event)}
                                    className="px-6 py-6 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border-b border-[var(--border-primary)] group relative text-[var(--text-primary)]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 max-w-[92%]">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                                <span className="font-bold">{event.category || t('hot_events.hot')}</span>
                                                <span className="w-1 h-1 rounded-[8px] bg-zinc-700" />
                                                <span>{event.status === 'SYNCING' ? t('hot_events.syncing') : t('hot_events.active')}</span>
                                            </div>
                                            <h3 className="text-[18px] font-bold text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight tracking-tight">
                                                {event.title}
                                            </h3>
                                            <p className="text-[14px] text-zinc-500 font-medium leading-relaxed line-clamp-2 mt-2 tracking-tight">
                                                {event.summary}
                                            </p>
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="h-1.5 w-1.5 rounded-[8px] bg-rose-500 animate-pulse" />
                                                <span className="text-[11px] font-bold text-zinc-400">
                                                    {event.post_count || t('hot_events.hot')} {t('hot_events.discussions')}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-zinc-300 group-hover:text-[var(--text-primary)] transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                             <div className="py-24">
                                <EmptyState
                                    type={EMPTY_STATE_CODES.SEARCH_EMPTY}
                                    title={t('hot_events.empty_desc')}
                                    action={{
                                        label: t('common.retry_now'),
                                        onClick: () => window.location.reload()
                                    }}
                                />
                            </div>
                        )}
                    </AnimatePresence>
            </div>
        </div>
    );
};

export default HotEventsContent;





