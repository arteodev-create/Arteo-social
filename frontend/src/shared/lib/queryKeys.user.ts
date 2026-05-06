export const userQueryKeys = {
  suggestedUsers: ['suggested-users'] as const,
  suggestions: ['suggestions'] as const,
  userProfile: (username: string | undefined) => ['user-profile', username] as const,
  profile: (uuid: string) => ['profile', uuid] as const,
  hoverProfile: (username: string) => ['hover-profile', username] as const,
};
