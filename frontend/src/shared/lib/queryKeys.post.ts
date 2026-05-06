export const postQueryKeys = {
  feed: ['feed'] as const,
  feedByAlgo: (algoUuid: string | null | undefined) => ['feed', algoUuid] as const,
  post: (uuid: string | undefined) => ['post', uuid] as const,
  postComments: (postId: string) => ['post-comments', postId] as const,
};
