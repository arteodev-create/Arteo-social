import { useQuery } from '@tanstack/react-query';
import { postApi } from '@features/post/api';
import { queryKeys } from '@shared/lib';
import { cacheManager } from './cacheManager';

export const usePostDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.post(id),
        queryFn: async () => {
            if (!id) return null;
            const res = await postApi.getPost(id);
            return res.data;
        },
        enabled: !!id,
        staleTime: 1000 * 10,
        refetchOnWindowFocus: true,
        placeholderData: (previousData) => {
            if (previousData) return previousData;
            if (id === undefined || id === null) return undefined;
            const cached = cacheManager.getPost(id);
            return cached || undefined;
        }
    });
};
