import React from 'react';
import { MagnifyingGlass, PushPin, Butterfly } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { algorithmApi } from '@features/algorithm/api';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import { cn } from '@shared/lib';
import { queryKeys } from '@shared/lib';

interface CustomFeed {
    uuid: string;
    name: string;
    description: string;
    author: {
        username: string;
        fullName?: string;
        avatar?: string;
    };
    iconUrl?: string;
    usageCount?: number;
    isPinned?: boolean;
}

interface FeedDiscoverySectionProps {
    feeds: CustomFeed[];
    isLoading?: boolean;
}

const getFeedIcon = (_name: string) => {
    return <Butterfly size={24} weight="thin" />;
};

const FeedDiscoverySection: React.FC<FeedDiscoverySectionProps> = ({ feeds, isLoading }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { refreshAlgorithms } = useAlgorithms();
    const [pinningId, setPinningId] = React.useState<string | null>(null);

    const handlePin = async (e: React.MouseEvent, feed: CustomFeed) => {
        e.stopPropagation(); // Prevent navigation
        if (pinningId || feed.isPinned) return;

        setPinningId(feed.uuid);
        try {
            await algorithmApi.pinAlgorithm(feed.uuid);
            toast.success(t('feed.pinned_success', 'Feed pinned successfully.'));
            // Invalidate queries to refresh the list if needed
            queryClient.invalidateQueries({ queryKey: queryKeys.searchRecommendations });
            // Refresh global algorithm context (for sidebar/header)
            refreshAlgorithms();
        } catch (error: any) {
            console.error('[FeedDiscovery] Pin error:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || t('feed.pin_failed', 'Unable to pin feed.');
            toast.error(msg);
        } finally {
            setPinningId(null);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex flex-col border-b border-black">
            <div className="px-6 py-4 flex items-center justify-between border-b border-black">
                <h3 className="text-[17px] font-black text-[var(--text-primary)] flex items-center gap-2">
                    <Butterfly size={24} weight="fill" className="text-[var(--text-primary)]" />
                    {t('search.discover_feeds') === 'search.discover_feeds' ? 'Discover feeds' : t('search.discover_feeds')}
                </h3>
                <div className="w-8 h-8 border border-black bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                    <MagnifyingGlass size={18} weight="bold" />
                </div>
            </div>

            <div className="flex flex-col">
                {feeds.map((feed) => (
                    <div 
                        key={feed.uuid} 
                        onClick={() => navigate(`/algorithms/${feed.uuid}`)}
                        className="px-6 py-7 border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group flex items-center gap-5"
                    >
                        <div className="w-16 h-16 bg-black flex items-center justify-center text-white shrink-0 overflow-hidden border border-black">
                            {feed.iconUrl ? (
                                <img src={feed.iconUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="scale-125 opacity-90">
                                    {getFeedIcon(feed.name)}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col min-w-0">
                                    <h4 className="text-[17px] font-black text-[var(--text-primary)] truncate">{feed.name}</h4>
                                    <p className="text-[13px] font-bold text-[var(--text-muted)] mt-1">
                                        {t('search.feed_by') === 'search.feed_by' ? 'by' : t('search.feed_by')} <span className="text-[var(--text-primary)] font-bold">@{feed.author?.username || (feed as any).user?.username || (feed as any).owner?.username || 'arteo'}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => handlePin(e, feed)}
                                    className={cn(
                                        "w-10 h-10 border border-black flex items-center justify-center transition-colors duration-200",
                                        feed.isPinned 
                                            ? "bg-black text-white" 
                                            : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-100"
                                    )}
                                    disabled={!!pinningId}
                                >
                                    <PushPin size={18} weight={feed.isPinned ? "fill" : "bold"} className={cn(pinningId === feed.uuid && "animate-spin")} />
                                </button>
                            </div>
                            
                            <p className="text-[14px] font-bold text-[var(--text-muted)] mt-2 line-clamp-1 leading-relaxed">
                                {feed.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedDiscoverySection;

