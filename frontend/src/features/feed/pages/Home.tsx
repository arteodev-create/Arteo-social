import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Butterfly, Globe, NotePencil } from '@phosphor-icons/react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { PostCard } from '@features/post';
import { LoadingSpinner } from '@shared/ui';
import { useAuthStore } from '@entities/session/model';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import { EmptyState } from '@shared/ui';
import { EMPTY_STATE_CODES } from '@constants/emptyStates';
import { useTranslation } from 'react-i18next';
import { FeedEndState } from '@shared/ui';
import { postApi } from '@features/post/api';
import { queryKeys } from '@shared/lib';
import type { PostsPage } from '@entities/post/model/types';

const HomeFeed: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeAlgoUuid } = useAlgorithms();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading: isFeedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: queryKeys.feedByAlgo(activeAlgoUuid),
    queryFn: async ({ pageParam = 1 }) => {
      return postApi.getFeed({
        page: pageParam,
        limit: 20,
        algorithmId: activeAlgoUuid || undefined
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      const currentPage = Number(pagination.page) || 1;
      const totalPages = Number(pagination.pages) || 1;
      const total = Number(pagination.total) || 0;
      if (total === 0 || currentPage >= totalPages) return undefined;
      return currentPage + 1;
    },
    enabled: !!user && activeAlgoUuid !== null && activeAlgoUuid !== '-1',
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const posts = data?.pages.flatMap((page) => (page?.data as PostsPage | undefined)?.posts || []) || [];

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: '800px',
        threshold: 0
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full flex-1 md:mt-4">
        {activeAlgoUuid === null || (isFeedLoading && !posts.length) ? (
          <LoadingView key="loading" />
        ) : activeAlgoUuid === '-1' ? (
          <NoAlgorithmView key="no-algo" />
        ) : error ? (
          <ErrorView key="error" onRetry={() => refetch()} />
        ) : posts.length === 0 ? (
          <EmptyState type={EMPTY_STATE_CODES.FEED_EMPTY} />
        ) : (
          <div className="flex flex-col pb-32">
            {posts.map((post: any) => (
              <PostCard key={post.uuid} post={post} />
            ))}

            {isFetchingNextPage && (
              <LoadingSpinner size="md" label={t('common.loading_more') || 'Loading more...'} />
            )}

            {!hasNextPage && posts.length > 0 && <FeedEndState />}

            <div ref={bottomRef} className="h-20" />
          </div>
        )}
    </div>
  );
};

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh]">
    <LoadingSpinner size="lg" label="Arteo is thinking..." />
  </div>
);

const ErrorView = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      type={EMPTY_STATE_CODES.CONNECTION_ERROR}
      action={{
        label: t('common.retry_now'),
        onClick: onRetry
      }}
    />
  );
};

const NoAlgorithmView = () => {
  const navigate = useNavigate();
  const { setActiveAlgoUuid } = useAlgorithms();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="max-w-xl mb-12">
        <h2 className="text-[24px] font-extrabold text-black mb-4 leading-tight">{t('home.no_algo_title')}</h2>
        <p className="text-[15px] text-black/60 font-medium leading-relaxed">
          {t('home.no_algo_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div onClick={() => navigate('/algorithms')} className="bg-black text-white border border-black rounded-[8px] p-5 flex flex-col cursor-pointer transition-transform active:scale-[0.99]">
          <div className="flex items-center gap-2.5 mb-3">
            <Butterfly size={20} weight="bold" />
            <h3 className="text-[16px] font-bold">{t('home.no_algo_community_title')}</h3>
          </div>
          <p className="text-[13px] text-white/70 font-medium mb-6 leading-relaxed text-left">
            {t('home.no_algo_community_desc')}
          </p>
          <div className="mt-auto w-full py-2.5 bg-white text-[12px] font-bold text-black border border-white text-center rounded-[6px]">{t('home.no_algo_community_cta')}</div>
        </div>

        <div onClick={() => navigate('/algorithms/studio')} className="bg-white border border-black rounded-[8px] p-5 flex flex-col cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors active:scale-[0.99]">
          <div className="flex items-center gap-2.5 mb-3">
            <NotePencil size={20} weight="bold" className="text-black" />
            <h3 className="text-[16px] font-bold text-black">{t('home.no_algo_create_title')}</h3>
          </div>
          <p className="text-[13px] text-black/65 font-medium mb-6 leading-relaxed text-left">
            {t('home.no_algo_create_desc')}
          </p>
          <div className="mt-auto w-full py-2.5 bg-black text-[12px] font-bold text-white text-center rounded-[6px]">{t('home.no_algo_create_cta')}</div>
        </div>

        <div onClick={() => setActiveAlgoUuid('00000000-0000-0000-0000-000000000001')} className="bg-white border border-black rounded-[8px] p-5 flex flex-col cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors active:scale-[0.99]">
          <div className="flex items-center gap-2.5 mb-3">
            <Globe size={20} weight="bold" className="text-black" />
            <h3 className="text-[16px] font-bold text-black">{t('home.no_algo_default_title')}</h3>
          </div>
          <p className="text-[13px] text-black/65 font-medium mb-6 leading-relaxed text-left">
            {t('home.no_algo_default_desc')}
          </p>
          <div className="mt-auto w-full py-2.5 bg-black text-[12px] font-bold text-white text-center rounded-[6px]">{t('home.no_algo_default_cta')}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
