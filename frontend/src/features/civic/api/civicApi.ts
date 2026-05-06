import { CivicService } from '@services/civic.service';

export const civicApi = {
  toggleFollow: CivicService.toggleFollow,
  getRelationshipStatus: CivicService.getRelationshipStatus,
  toggleReaction: CivicService.toggleReaction,
  reportPost: CivicService.reportPost,
  blockUser: CivicService.blockUser,
};
