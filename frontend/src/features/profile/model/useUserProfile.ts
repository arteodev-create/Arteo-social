import { useQuery } from '@tanstack/react-query';
import { userApi } from '@features/user/api';
import { queryKeys } from '@shared/lib';

export const useUserProfile = (username: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.userProfile(username),
        queryFn: async () => {
            if (!username) return null;
            const res = await userApi.getProfileByUsername(username);
            return res || null;
        },
        enabled: !!username,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false
    });
};
