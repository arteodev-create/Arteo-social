import { SearchService } from '@services/search.service';

export const searchApi = {
  searchAll: SearchService.searchAll,
  searchUsers: SearchService.searchUsers,
  getTrending: SearchService.getTrending,
  getRecommendations: SearchService.getRecommendations,
  getHotEvents: SearchService.getHotEvents,
  getTrendDetail: SearchService.getTrendDetail,
  getPersonalizedSummary: SearchService.getPersonalizedSummary,
};
