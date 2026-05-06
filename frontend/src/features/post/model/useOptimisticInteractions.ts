import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@features/post/api';
import { queryKeys } from '@shared/lib';
import { civicApi } from '@features/civic/api';

type LikeInput = { uuid: string; isLiked: boolean };
type BookmarkInput = { uuid: string; isBookmarked: boolean };
type RepostInput = { uuid: string; isReposted: boolean };
type ReactionInput = { uuid?: string; postId?: string; emoji: string };

export const useOptimisticInteractions = () => {
    const queryClient = useQueryClient();

    const invalidatePostState = (uuid?: string) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.feed });
        queryClient.invalidateQueries({ queryKey: queryKeys.userPosts });
        if (uuid) queryClient.invalidateQueries({ queryKey: queryKeys.post(uuid) });
    };

    const likeMutation = useMutation({
        mutationFn: ({ uuid, isLiked }: LikeInput) => (
            isLiked ? postApi.unlikePost(uuid) : postApi.likePost(uuid)
        ),
        onSettled: (_data, _error, variables) => invalidatePostState(variables?.uuid)
    });

    const repostMutation = useMutation({
        mutationFn: ({ uuid, isReposted }: RepostInput) => (
            isReposted ? postApi.unrepostPost(uuid) : postApi.repostPost(uuid)
        ),
        onSettled: (_data, _error, variables) => invalidatePostState(variables?.uuid)
    });

    const bookmarkMutation = useMutation({
        mutationFn: ({ uuid, isBookmarked }: BookmarkInput) => (
            isBookmarked ? postApi.unbookmarkPost(uuid) : postApi.bookmarkPost(uuid)
        ),
        onSettled: (_data, _error, variables) => invalidatePostState(variables?.uuid)
    });

    const reactionMutation = useMutation({
        mutationFn: ({ uuid, postId, emoji }: ReactionInput) => (
            civicApi.toggleReaction(postId || uuid || '', emoji)
        ),
        onSettled: (_data, _error, variables) => invalidatePostState(variables?.postId || variables?.uuid)
    });

    const followMutation = useMutation({
        mutationFn: (uuid: string) => civicApi.toggleFollow(uuid),
        onSettled: (_data, _error, uuid) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(uuid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.suggestions });
        }
    });

    return {
        like: likeMutation.mutate,
        repost: repostMutation.mutate,
        bookmark: bookmarkMutation.mutate,
        react: reactionMutation.mutate,
        follow: followMutation.mutate,
        isLiking: likeMutation.isPending,
        isReposting: repostMutation.isPending,
        isBookmarking: bookmarkMutation.isPending,
        isReacting: reactionMutation.isPending,
        isFollowing: followMutation.isPending
    };
};
