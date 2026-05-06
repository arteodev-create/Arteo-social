import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Binoculars, X, Users } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';
import { Icons } from '@shared/ui';

import { searchApi } from '@features/search/api';
import { PostCard } from '@features/post';
import { LoadingSpinner } from '@shared/ui';
import { SEO } from '@shared/ui';
import { EmptyState } from '@shared/ui';
import { Avatar } from '@shared/ui';
import { Tabs, TabItem } from '@shared/ui';

import { EMPTY_STATE_CODES } from '@constants/emptyStates';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { postApi } from '@features/post/api';
import { queryKeys } from '@shared/lib';
import { useAuth } from '@entities/session/model';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import TrendingSection from '@features/search/ui/TrendingSection';
import FeedDiscoverySection from '@features/search/ui/FeedDiscoverySection';
import SuggestedAccountsSection from '@features/search/ui/SuggestedAccountsSection';

const SearchPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const tab = searchParams.get('tab') || 'all';

    const { user } = useAuth();
    const { activeAlgoUuid, setActiveAlgoUuid } = useAlgorithms();
    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [discoveryAlgoUuid, setDiscoveryAlgoUuid] = useState<string | null>(null);

    // --- Discovery Data ---
    const { data: trendingResponse, isLoading: isTrendingLoading } = useQuery({
        queryKey: queryKeys.searchTrending,
        queryFn: () => searchApi.getTrending(),
        enabled: !query && !!user,
    });

    const { data: recoResponse, isLoading: isRecoLoading } = useQuery({
        queryKey: queryKeys.searchRecommendations,
        queryFn: () => searchApi.getRecommendations(),
        enabled: !query && !!user,
    });

    const trendingTopics = (trendingResponse as any)?.data?.trending || [];
    const recommendedUsers = (recoResponse as any)?.data?.experts || [];
    const recommendedFeeds = useMemo(() => {
        return (recoResponse as any)?.data?.randomAlgorithms || [];
    }, [recoResponse]);

    // Pick a random discovery algorithm from the recommendations
    useEffect(() => {
        if (recommendedFeeds.length > 0 && !discoveryAlgoUuid) {
            const randomIndex = Math.floor(Math.random() * recommendedFeeds.length);
            setDiscoveryAlgoUuid(recommendedFeeds[randomIndex].uuid);
        } else if (!discoveryAlgoUuid && activeAlgoUuid) {
            // Fallback to active algorithm if recommendations aren't loaded yet
            setDiscoveryAlgoUuid(activeAlgoUuid);
        }
    }, [recommendedFeeds, discoveryAlgoUuid, activeAlgoUuid]);

    // --- Explore Feed (When no query) ---
    const {
        data: exploreData,
        isLoading: isExploreLoading,
        hasNextPage: hasExploreNextPage,
        fetchNextPage: fetchExploreNextPage,
    } = useInfiniteQuery({
        queryKey: queryKeys.searchExplore(discoveryAlgoUuid),
        queryFn: async ({ pageParam = 1 }) => {
            return postApi.getFeed({
                page: pageParam,
                limit: 10,
                algorithmId: discoveryAlgoUuid || undefined,
                sort: 'trending'
            });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination) return undefined;
            const currentPage = parseInt(pagination.page) || 1;
            const totalPages = parseInt(pagination.pages) || 1;
            if (currentPage >= totalPages) return undefined;
            return currentPage + 1;
        },
        enabled: !query && !!user && discoveryAlgoUuid !== null,
    });

    const explorePosts = exploreData?.pages.flatMap((page: any) => page?.data?.posts || []) || [];

    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            const scrollContainer = document.querySelector('main .overflow-y-auto');
            if (scrollContainer) scrollContainer.scrollTop = 0;
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await searchApi.searchAll(query, tab === 'all' ? undefined : tab);
                if (response.success) {
                    setResults(response.data);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query, tab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue, tab });
        }
    };

    const handleTabChange = (newTab: string) => {
        setSearchParams({ q: query, tab: newTab });
    };
    const searchTabs: TabItem[] = [
        { id: 'all', label: t('search.tab_all') },
        { id: 'posts', label: t('search.tab_posts') },
        { id: 'people', label: t('search.tab_people') },
        { id: 'hashtags', label: t('search.tab_hashtags') }
    ];

    const clearSearch = () => {
        setInputValue('');
        setSearchParams({});
    };



    const renderResults = () => {
        if (!query && !isLoading) {
            if (isTrendingLoading || isRecoLoading) {
                return (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
                        <LoadingSpinner />
                    </div>
                );
            }

            return (
                <div className="flex flex-col pb-20">
                    <TrendingSection 
                        topics={trendingTopics} 
                        isLoading={isTrendingLoading} 
                    />
                    <FeedDiscoverySection 
                        feeds={recommendedFeeds} 
                        isLoading={isRecoLoading} 
                    />
                    <SuggestedAccountsSection 
                        users={recommendedUsers} 
                        categories={(recoResponse as any)?.data?.categories}
                        isLoading={isRecoLoading} 
                    />
                    
                    {explorePosts.length > 0 && (
                        <div className="flex flex-col">
                            {(() => {
                                const currentAlgo = recommendedFeeds.find((a: any) => a.uuid === discoveryAlgoUuid) || recommendedFeeds[0];
                                const algoName = currentAlgo?.name || 'Arteo Standard';
                                const algoAuthorUsername = currentAlgo?.author?.username || 'arteo';
                                const algoUuid = currentAlgo?.uuid || 'arteo-standard';

                                return (
                                    <div 
                                        className="px-6 py-4 flex items-center justify-between border-b border-black group cursor-pointer hover:bg-[var(--bg-secondary)]"
                                        onClick={() => {
                                            setActiveAlgoUuid(algoUuid);
                                            // @ts-ignore
                                            import('sonner').then(({ toast }) => {
                                                toast.success(`Algorithm activated: ${algoName}`);
                                            });
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-black flex items-center justify-center text-white">
                                                <Icons.Butterfly size={20} weight="thin" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-[16px] font-bold text-[var(--text-primary)] tracking-tight">Community Pulse</h4>
                                                <p className="text-[13px] font-bold text-[var(--text-muted)]">
                                                    Powered by <span className="text-[var(--text-primary)] font-bold">{algoName}</span> (@{algoAuthorUsername})
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="flex flex-col">
                                {explorePosts.map((post: any) => (
                                    <PostCard key={post.uuid} post={post} />
                                ))}
                            </div>
                            {hasExploreNextPage && (
                                <div className="p-6 text-center">
                                    <button 
                                        onClick={() => fetchExploreNextPage()}
                                        className="h-11 border border-black px-5 text-[13px] font-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        {t('common.load_more')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {isExploreLoading && discoveryAlgoUuid && (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                    <LoadingSpinner />
                </div>
            );
        }

        const hasResults = (results?.posts?.length > 0) || (results?.users?.length > 0);

        if (!hasResults) {
            return (
                <div className="py-20">
                    <EmptyState 
                        type={EMPTY_STATE_CODES.SEARCH_EMPTY} 
                        title={t('search.no_results_title')}
                        description={t('search.no_results_desc', { query })}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                {results?.users?.length > 0 && (
                    <div className="flex flex-col border-b border-black">
                        <div className="px-6 py-4 flex items-center gap-2 border-b border-black text-[12px] font-black uppercase tracking-wide text-[var(--text-muted)]">
                            <Users size={16} weight="light" />
                            <span>{t('search.people')}</span>
                        </div>
                        {results.users.map((user: any) => (
                            <div 
                                key={user.uuid}
                                onClick={() => navigate(`/${user.username}`)}
                                className="px-6 py-4 flex items-center gap-4 border-b border-[var(--border-primary)] last:border-b-0 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors"
                            >
                                <Avatar 
                                    src={user.avatar} 
                                    username={user.username} 
                                    seed={user.uuid}
                                    size={48} 
                                    className="shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[15px] font-bold text-[var(--text-primary)] truncate">{user.fullName || user.username}</span>
                                    <span className="text-[13px] font-bold text-[var(--text-muted)] truncate">@{user.username}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {results?.posts?.map((post: any) => (
                    <PostCard key={post.uuid} post={post} />
                ))}
            </div>
        );
    };

    return (
        <MainLayout layoutMode="standard">
            <SEO title={query ? `${query} - Search` : 'Search'} />
            
            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                <PageHeader
                    title={
                        query ? (
                            <div className="flex flex-col items-start">
                                <span className="text-[17px] font-black tracking-tight leading-none">{t('search.results_title')}</span>
                                <span className="text-[11px] text-[var(--text-muted)] font-bold mt-1 truncate max-w-[200px]">"{query}"</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start">
                                <span className="text-[20px] font-black tracking-tight leading-none">Discovery</span>
                                <span className="text-[12px] text-[var(--text-muted)] font-bold mt-0.5">Platform Pulse</span>
                            </div>
                        )
                    }
                    showBackButton={!!query}
                    onBackClick={() => navigate(-1)}
                    className="z-50"
                />

                <section className="border-b border-black bg-[var(--bg-primary)]">
                    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-4 px-5 py-5 md:grid-cols-[72px_minmax(0,1fr)_160px] md:px-6">
                        <div className="flex h-14 w-14 items-center justify-center border border-black bg-black text-white md:h-[72px] md:w-[72px]">
                            <Binoculars size={28} weight="bold" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-[26px] font-black leading-none tracking-tight text-[var(--text-primary)] md:text-[34px]">
                                {query ? t('search.results_title') : 'Search Arteo'}
                            </h2>
                            <p className="mt-2 truncate text-[14px] font-bold text-[var(--text-muted)]">
                                {query ? `"${query}"` : t('search.placeholder')}
                            </p>

                            <form id="search-form" onSubmit={handleSearch} className="relative mt-5 flex items-center">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--text-muted)]">
                                    <Binoculars size={18} weight="bold" />
                                </div>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('search.placeholder')}
                                    className="h-12 w-full border border-black bg-[var(--bg-primary)] pl-12 pr-12 text-[14px] font-bold text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:bg-[var(--bg-secondary)]"
                                />
                                {inputValue && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center border-l border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                                        aria-label={t('common.clear', 'Clear')}
                                    >
                                        <X size={16} weight="bold" />
                                    </button>
                                )}
                            </form>
                        </div>

                        <div className="col-span-2 grid grid-cols-2 border-t border-black md:col-span-1 md:block md:border-t-0">
                            <button
                                type="submit"
                                form="search-form"
                                className="h-11 border-r border-black px-4 text-[13px] font-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] md:mb-2 md:w-full md:border md:border-black"
                            >
                                {t('common.search', 'Search')}
                            </button>
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="h-11 px-4 text-[13px] font-black text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] md:w-full md:border md:border-black"
                            >
                                {t('common.clear', 'Clear')}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Tabs - Only show when searching */}
                {query && (
                    <div className="sticky top-[72px] z-40 bg-[var(--bg-primary)] border-b border-black">
                        <Tabs
                            tabs={searchTabs}
                            activeTab={tab}
                            onChange={handleTabChange}
                            fullWidth={true}
                            className="border-x-0 border-t-0 border-b-0"
                        />
                    </div>
                )}

                {/* Results Area */}
                <div className="flex-1 animate-platinum-in pb-24">
                    {renderResults()}
                </div>
            </div>
        </MainLayout>
    );
};

export default SearchPage;
