import { useQuery } from '@tanstack/react-query';
import { userApi } from '@features/user/api';
import { queryKeys } from '@shared/lib';

export const useSuggestedUsers = (limit: number = 3) => {
    return useQuery({
        queryKey: [...queryKeys.suggestedUsers, limit],
        queryFn: async () => {
            const res = await userApi.getSuggestions(limit);
            return Array.isArray(res.data) ? res.data : (res.data?.users || []);
        },
        staleTime: 1000 * 60 * 10,
    });
};
