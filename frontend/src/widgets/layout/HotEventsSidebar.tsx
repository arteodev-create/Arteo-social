import React from 'react';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@features/search/api';
import type { ApiResponse } from '@shared/api';
import { queryKeys } from '@shared/lib';

interface HotEvent {
    title: string;
    summary: string;
    category?: string;
    post_count?: string;
    hashtags?: string[];
    status?: string;
}

const HotEventsSidebar = () => {
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery<ApiResponse<any>, Error>({
        queryKey: queryKeys.hotEventsSidebar,
        queryFn: () => searchApi.getHotEvents(),
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });

    const events: HotEvent[] = React.useMemo(() => {
        if (!response?.success || !response?.data) return [];
        const rawData = response.data.trending || response.data.events || response.data;
        return Array.isArray(rawData) ? rawData.slice(0, 5) : [];
    }, [response]);

    const generateSlug = (text: string) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .trim()
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    if (isLoading && events.length === 0) return (
        <div className="bg-white border border-zinc-100 rounded-[8px] p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded-[8px] w-1/2" />
            <div className="space-y-3">
                <div className="h-12 bg-zinc-50 rounded-[8px]" />
                <div className="h-12 bg-zinc-50 rounded-[8px]" />
            </div>
        </div>
    );

    if (events.length === 0) return null;

    return (
        <div className="bg-white border border-zinc-100 rounded-[8px] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-50 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[17px] font-bold text-black tracking-tight flex items-center gap-2">
                        <TrendingUp size={18} className="text-black" strokeWidth={1.2} />
                        Trending now
                    </h3>
                    <div className="w-2 h-2 bg-rose-500 rounded-[0px]" />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-black rounded-[8px] tracking-tight">
                    <Sparkles size={11} className="text-black fill-black/10" />
                    Arteo Intelligence
                </div>
            </div>

            <div className="flex flex-col py-0">
                {events.map((event, idx) => (
                    <div
                        key={idx}
                        onClick={() => {
                            const slug = generateSlug(event.title);
                            navigate(`/hot-events/${slug}`, { state: { trend: event } });
                        }}
                        className="group flex flex-col gap-1 py-4 px-6 cursor-pointer relative border-b border-zinc-50 last:border-0"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold lowercase">
                                <span>{event.category?.toLowerCase() || 'trend'}</span>
                                {event.status === 'LIVE' && (
                                    <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-[0px] bg-rose-500" />
                                        LIVE
                                    </span>
                                )}
                            </div>
                        </div>

                        <h4 className="text-[15px] font-bold text-black leading-tight tracking-tight">
                            {event.title}
                        </h4>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] px-2 py-0.5 bg-zinc-50 text-zinc-400 rounded-[6px] font-bold tracking-tight">
                                {event.post_count || 'HOT'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/hot-events')}
                className="w-full text-center px-6 py-5 text-[12px] font-bold text-black flex items-center justify-center gap-2 border-t border-zinc-50"
            >
                See more
                <Plus size={14} />
            </button>
        </div>
    );
};

export default HotEventsSidebar;
