import { UserService } from '@services/user.service';

export const userApi = {
  getProfileByUsername: UserService.getProfileByUsername,
};
