export const searchQueryKeys = {
  trendingTags: ['trending-tags'] as const,
  searchAll: (query: string, type?: string) => ['search-all', query, type] as const,
  aiDiscoverySummary: ['ai-discovery-summary'] as const,
  searchTrending: ['search-trending'] as const,
  searchRecommendations: ['search-recommendations'] as const,
  searchExplore: (algoUuid: string | null) => ['search-explore', algoUuid] as const,
  hotEventsSidebar: ['hot-events-sidebar'] as const,
  hotEventsAnalysisPage: ['hot-events-analysis-page'] as const,
};
