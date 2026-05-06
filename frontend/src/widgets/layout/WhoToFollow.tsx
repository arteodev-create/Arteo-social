import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CivicService } from '../../services/civic.service';
import { useSuggestedUsers } from '@entities/user';
import { User } from '@entities/user/model';
import { getImageUrl } from '@shared/lib';
import { VerificationBadge } from '../../entities/verification';
import { UserHoverCard } from '../../entities/user';
import { Avatar } from '@shared/ui';
import { User as UserIcon, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { hasCapability } from '@entities/session/model/accessControl';
import { useAuthStore } from '@entities/session/model';
import { CapabilityGuard } from '@features/access-control';

interface WhoToFollowProps {
    inFeed?: boolean;
}

const WhoToFollow: React.FC<WhoToFollowProps> = ({ inFeed = false }) => {
    const { t } = useTranslation();
    const { user: authUser } = useAuthStore();
    const canFollowUser = hasCapability(authUser, 'user:follow');
    const { data: suggestions = [], isLoading: loading } = useSuggestedUsers(3);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    const handleFollow = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        if (followingIds.has(userId)) return;

        try {
            const res = await CivicService.toggleFollow(userId);
            if (res.success) {
                setFollowingIds(prev => new Set(prev).add(userId));
            }
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    if (loading) return null;

    if (suggestions.length === 0) return null;

    return (
        <div className={`bg-[var(--bg-primary)] ${inFeed ? 'border-b border-[var(--border-primary)]' : 'border border-[var(--border-primary)] rounded-[8px] overflow-hidden'}`}>
            <div className="p-5 border-b border-[var(--border-primary)]/50">
                <h2 className="text-[15px] font-bold text-[var(--text-primary)] font-display">
                    {t('suggestions.title')}
                </h2>
            </div>

            <div className="divide-y divide-[var(--border-primary)]/50">
                {suggestions.map((user) => (
                    <div
                        key={user.uuid}
                        onClick={() => navigate(`/${user.username}`)}
                        className="px-5 py-4 cursor-pointer group flex items-center justify-between gap-3 hover:bg-[var(--bg-secondary)]"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <UserHoverCard username={user.username}>
                                <Avatar 
                                    src={user.avatar} 
                                    username={user.username} 
                                    seed={user.uuid}
                                    size="sm" 
                                />
                            </UserHoverCard>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[14px] truncate text-[var(--text-primary)] leading-none font-display">
                                        {user.fullName || user.username}
                                    </span>
                                    <VerificationBadge
                                        isVerified={user.isVerified}
                                        verificationType={user.verificationType}
                                        className="w-3 h-3"
                                    />
                                </div>
                                <span className="text-[11px] text-zinc-500 font-medium truncate">
                                    @{user.username}
                                </span>
                            </div>
                        </div>

                        <CapabilityGuard
                            capability="user:follow"
                            fallback={
                                <button
                                    disabled
                                    className="px-4 py-1.5 rounded-[8px] text-[12px] font-bold bg-[var(--bg-secondary)] text-zinc-500 cursor-default"
                                >
                                    {t('common.unavailable', 'Unavailable')}
                                </button>
                            }
                        >
                            <button
                                onClick={(e) => handleFollow(e, user.uuid)}
                                disabled={followingIds.has(user.uuid) || !canFollowUser}
                                className={`px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-none ${followingIds.has(user.uuid)
                                    ? 'bg-[var(--bg-secondary)] text-zinc-500 cursor-default'
                                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                    }`}
                            >
                                {followingIds.has(user.uuid) ? t('suggestions.following') : t('suggestions.follow')}
                            </button>
                        </CapabilityGuard>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/search')}
                className="w-full p-5 text-left text-[13px] font-bold text-[var(--text-primary)] flex items-center justify-between font-display hover:bg-[var(--bg-secondary)]"
            >
                <span>{t('suggestions.more')}</span>
                <Plus size={12} className="text-zinc-500" />
            </button>
        </div>
    );
};

export default WhoToFollow;

