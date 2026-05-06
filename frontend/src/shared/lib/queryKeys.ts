import { algorithmQueryKeys } from './queryKeys.algorithm';
import { pluginQueryKeys } from './queryKeys.plugin';
import { postQueryKeys } from './queryKeys.post';
import { profileQueryKeys } from './queryKeys.profile';
import { searchQueryKeys } from './queryKeys.search';
import { userQueryKeys } from './queryKeys.user';

export const queryKeys = {
  ...postQueryKeys,
  ...profileQueryKeys,
  ...userQueryKeys,
  ...searchQueryKeys,
  ...algorithmQueryKeys,
  ...pluginQueryKeys,
};
