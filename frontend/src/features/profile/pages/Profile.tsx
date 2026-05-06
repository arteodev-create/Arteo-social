import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DotsThree,
    ShareNetwork,
    PencilSimpleLine,
    MapPin,
    Calendar,
    PlusCircle
} from '@phosphor-icons/react';
import { VerificationBadge } from '@entities/verification';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '@entities/session/model';
import { useTranslation } from 'react-i18next';
import { PostCard } from '../../post';
import { postApi } from '../../post/api';
import { getImageUrl } from '@shared/lib';
import { User } from '@entities/user/model';
import { Avatar } from '@shared/ui';
import { useUserProfile } from '@features/profile/model';
import { useModal } from '../../../contexts/ModalContext';
import { Tabs, TabItem } from '@shared/ui';
import { Button } from '@shared/ui';
import { FeedEndState } from '@shared/ui';
import { Virtuoso } from 'react-virtuoso';
import { EmptyState } from '@shared/ui';
import { EMPTY_STATE_CODES } from '../../../constants/emptyStates';
import { toast } from 'sonner';
import { MODAL_IDS } from '../../../constants/modalIds';
import { LoadingSpinner } from '@shared/ui';
import { hasCapability } from '@entities/session/model/accessControl';
import { CapabilityGuard } from '@features/access-control';
import { queryKeys } from '@shared/lib';

interface ProfileHeaderRenderOptions {
    title: React.ReactNode;
    subtitle?: string;
    centered?: boolean;
    actions?: React.ReactNode;
}

const LAUNCH_CORE_ONLY = true;

const ProfileContent: React.FC<{
    username?: string;
    initialTab?: string;
    autoOpenAvatar?: boolean;
    renderHeader?: (options: ProfileHeaderRenderOptions) => React.ReactNode;
}> = ({ username: propUsername, initialTab, autoOpenAvatar: _autoOpenAvatar, renderHeader }) => {
    const { username: paramUsername } = useParams<{ username: string }>();
    const username = propUsername || paramUsername;

    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const canFollowUser = hasCapability(authUser, 'user:follow');
    const queryClient = useQueryClient();
    const { openModal } = useModal();

    const { data: profileUser, isLoading: isProfileLoading, isError } = useUserProfile(username);

    const [activeTab, setActiveTab] = useState(initialTab || 'posts');
    const profileTabs: TabItem[] = [
        { id: 'posts', label: t('profile.tabs.posts') },
        { id: 'replies', label: t('profile.tabs.replies') },
        { id: 'media', label: t('profile.tabs.media') },
        { id: 'reposts', label: t('profile.tabs.reposts') },
    ];

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPostsLoading
    } = useInfiniteQuery({
        queryKey: ['user-posts', profileUser?.uuid || `@${username}`, activeTab],
        queryFn: ({ pageParam = 1 }) =>
            postApi.getUserPosts(profileUser?.uuid || `@${username}`, { tab: activeTab, page: pageParam, limit: 15 }),
        enabled: (!!profileUser?.uuid || !!username) && !isError,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.data?.pagination;
            if (!pagination) return undefined;
            const currentPage = Number(pagination.page) || 1;
            const pageLimit = Number(pagination.limit) || 20;
            const total = Number(pagination.total) || 0;
            return currentPage * pageLimit < total ? currentPage + 1 : undefined;
        },
        staleTime: 10000,
        gcTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData
    });

    const { inView } = useInView({ threshold: 0.1 });

    React.useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const posts = infiniteData?.pages.flatMap(page => page?.data?.posts || []) || [];
    const totalCount = infiniteData?.pages[0]?.data?.pagination?.total || 0;
    const isOwnProfile = authUser && profileUser && authUser.uuid === profileUser.uuid;

    const handleEditProfile = () => {
        if (!profileUser) return;
        openModal(MODAL_IDS.EDIT_PROFILE, {
            user: profileUser,
            onUpdate: (updatedUser: User) => {
                queryClient.setQueryData(['user-profile', username], updatedUser);
                queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(username) });
            }
        });
    };
    const handleCreatePost = () => openModal(MODAL_IDS.CREATE_POST);
    const handleFollowToggle = () => toast.info(t('profile.feature_in_development'));
    const handleShareProfile = async () => {
        const profileUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(profileUrl);
            toast.success(t('common.copied') || 'Copied');
        } catch {
            toast.info(profileUrl);
        }
    };
    const followMutationPending = false;

    const avatarUrl = profileUser?.avatar ? getImageUrl(profileUser.avatar) : null;

    if (isProfileLoading) {
        return (
            <>
                {renderHeader?.({
                    title: username ? `@${username}` : t('common.loading'),
                    centered: true
                })}
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <LoadingSpinner size="lg" label={t('profile.loading')} />
                </div>
            </>
        );
    }

    if (isError || !profileUser) {
        return (
            <>
                {renderHeader?.({
                    title: username ? `@${username}` : t('profile.not_found'),
                    centered: true
                })}
                <div className="flex flex-col items-center justify-center py-20 px-6">
                    <EmptyState 
                        type={EMPTY_STATE_CODES.USER_NOT_FOUND} 
                        description={t('profile.user_not_found', { username })}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                {renderHeader?.({
                    title: profileUser?.fullName || profileUser?.username || '',
                    subtitle: `${totalCount} ${t('profile.stats.posts')}`,
                    centered: true,
                    actions: (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-[8px] hover:bg-[var(--bg-secondary)] active:scale-90 transition-all"
                            >
                                <DotsThree className="w-6 h-6 text-[var(--text-primary)]" weight="bold" />
                            </Button>
                        </div>
                    )
                })}

                <div className="flex-1 w-full flex flex-col">
                    {/* ===== PROFILE SUMMARY ===== */}
                    <section className="border-b border-black bg-[var(--bg-primary)]">
                        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-5 px-5 py-6 md:grid-cols-[120px_minmax(0,1fr)_180px] md:px-6">
                            <button
                                className="relative h-24 w-24 overflow-hidden border border-black bg-[var(--bg-secondary)] md:h-[120px] md:w-[120px]"
                                onClick={() => avatarUrl && openModal(MODAL_IDS.LIGHTBOX, { mediaUrls: [avatarUrl], initialIndex: 0 })}
                                type="button"
                            >
                                <Avatar
                                src={profileUser.avatar}
                                username={profileUser.username}
                                seed={profileUser.uuid}
                                className="h-full w-full border-0"
                                loading="eager"
                                />
                                {isOwnProfile && (
                                    <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center border-l border-t border-black bg-[var(--bg-primary)]">
                                        <PencilSimpleLine className="h-4 w-4 text-[var(--text-primary)]" weight="bold" />
                                    </span>
                                )}
                            </button>

                            <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex max-w-full items-center gap-2">
                                            <h2 className="min-w-0 flex-1 truncate text-[26px] font-black leading-none tracking-tight text-[var(--text-primary)] md:text-[34px]">
                                                {profileUser.fullName || profileUser.username}
                                            </h2>
                                            <VerificationBadge
                                                isVerified={profileUser.isVerified}
                                                verificationType={profileUser.verificationType}
                                                size={22}
                                                className="shrink-0"
                                            />
                                        </div>
                                        <p className="mt-2 truncate text-[14px] font-bold text-[var(--text-muted)]">
                                            @{profileUser.username}
                                        </p>
                                    </div>
                                </div>

                                {profileUser.bio ? (
                                    <p className="mt-5 max-w-xl text-[15px] font-medium leading-relaxed text-[var(--text-primary)]">
                                        {profileUser.bio}
                                    </p>
                                ) : isOwnProfile ? (
                                    <button
                                        type="button"
                                        onClick={handleEditProfile}
                                        className="mt-5 inline-flex max-w-full items-center gap-2 border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-left text-[13px] font-black text-[var(--text-primary)] transition-all hover:border-[var(--text-primary)] hover:bg-[var(--bg-primary)] active:scale-[0.98]"
                                    >
                                        <PencilSimpleLine className="h-4 w-4 shrink-0" weight="bold" />
                                        <span className="truncate">{t('profile.add_bio')}</span>
                                    </button>
                                ) : (
                                    <p className="mt-5 max-w-xl text-[14px] font-bold text-[var(--text-muted)]">
                                        No bio yet
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {profileUser.location && (
                                        <div className="flex h-9 items-center gap-2 border border-[var(--border-primary)] px-3 text-[12px] font-bold text-[var(--text-muted)]">
                                            <MapPin className="h-4 w-4" weight="bold" />
                                            <span>{profileUser.location}</span>
                                        </div>
                                    )}
                                    {profileUser.createdAt && (
                                        <div className="flex h-9 items-center gap-2 border border-[var(--border-primary)] px-3 text-[12px] font-bold text-[var(--text-muted)]">
                                            <Calendar className="h-4 w-4" weight="bold" />
                                            <span>{t('profile.joined', { date: new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2 flex gap-2 md:col-span-1 md:flex-col">
                                {isOwnProfile ? (
                                    <>
                                        <Button onClick={handleEditProfile} variant="primary" className="h-11 flex-1 text-[13px] font-black md:flex-none">
                                            {t('profile.edit_profile')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-11 w-12 shrink-0 md:w-full"
                                            onClick={handleShareProfile}
                                        >
                                            <ShareNetwork className="h-5 w-5 text-[var(--text-primary)]" weight="bold" />
                                        </Button>
                                    </>
                                ) : LAUNCH_CORE_ONLY ? null : (
                                    <CapabilityGuard
                                        capability="user:follow"
                                        fallback={
                                            <Button disabled className="h-11 flex-1 font-black md:flex-none" variant="outline">
                                                {t('common.unavailable')}
                                            </Button>
                                        }
                                    >
                                        <Button
                                            onClick={handleFollowToggle}
                                            disabled={followMutationPending || !canFollowUser}
                                            className="h-11 flex-1 font-black md:flex-none"
                                            variant={profileUser.isFollowing ? 'outline' : 'primary'}
                                        >
                                            {profileUser.isFollowing ? t('common.following') : t('common.follow')}
                                        </Button>
                                    </CapabilityGuard>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 border-t border-black">
                            {[
                                { label: t('profile.stats.posts'), value: profileUser.postsCount || 0 },
                                { label: t('profile.stats.following'), value: profileUser.followingCount || 0 },
                                { label: t('profile.stats.followers'), value: profileUser.followersCount || 0 }
                            ].map((stat, idx) => (
                                <button
                                    key={stat.label}
                                    className="border-r border-black px-4 py-4 text-left last:border-r-0 hover:bg-[var(--bg-secondary)]"
                                    type="button"
                                >
                                    <span className="block text-[20px] font-black leading-none text-[var(--text-primary)]">{stat.value}</span>
                                    <span className="mt-1 block text-[11px] font-black uppercase tracking-wide text-[var(--text-muted)]">{stat.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ===== TABS ===== */}
                    <div className="sticky top-[72px] z-40 bg-[var(--bg-primary)] border-b border-black">
                        <Tabs
                            tabs={profileTabs}
                            activeTab={activeTab}
                            onChange={(id) => setActiveTab(id)}
                            fullWidth={true}
                            className="border-x-0 border-t-0 border-b-0"
                        />
                    </div>

                {/* ===== OWNER SECTIONS ===== */}
                {isOwnProfile && (profileUser.postsCount || 0) === 0 && (
                    <div className="px-5 py-5 border-b border-[var(--border-primary)]">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleCreatePost}
                                className="flex items-center gap-3 rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 text-left transition-all hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-[0.99]"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-secondary)]">
                                    <PlusCircle className="h-5 w-5 text-[var(--text-primary)]" weight="bold" />
                                </span>
                                <span className="min-w-0 text-[13px] font-black text-[var(--text-primary)]">
                                    {t('profile.create_post')}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== CONTENT AREA ===== */}
                <div className="min-h-[600px] relative">
                    <AnimatePresence mode="wait">
                        {isPostsLoading && posts.length === 0 ? (
                            <div className="py-20 flex justify-center w-full">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : posts.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24">
                                <EmptyState type={EMPTY_STATE_CODES.PROFILE_EMPTY} />
                            </motion.div>
                        ) : (
                            <div style={{ height: 'calc(100vh - 200px)' }}>
                                <Virtuoso
                                    style={{ height: '100%' }}
                                    data={posts}
                                    endReached={() => {
                                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                                    }}
                                    itemContent={(index, post) => (
                                        <PostCard key={post.uuid} post={post} />
                                    )}
                                    components={{
                                        Footer: () => (
                                            <div className="py-8 flex justify-center w-full">
                                                {isFetchingNextPage ? <LoadingSpinner size="sm" /> : !hasNextPage && <FeedEndState />}
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    </>
);
};

export default ProfileContent;
