import { UserService } from '@services/user.service';

export const userApi = {
  getProfile: UserService.getProfile,
  getProfileByUsername: UserService.getProfileByUsername,
  getSuggestions: UserService.getSuggestions,
  pinPost: UserService.pinPost,
};
