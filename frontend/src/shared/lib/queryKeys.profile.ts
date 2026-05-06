export const profileQueryKeys = {
  userPosts: ['user-posts'] as const,
  userPostsByTab: (owner: string, tab: string) => ['user-posts', owner, tab] as const,
};
