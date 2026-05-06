import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@entities/user/api';
import { VerificationBadge } from '../../verification';
import { Avatar } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { queryKeys } from '@shared/lib';

interface UserHoverCardProps {
    username: string;
    children: React.ReactNode;
}

const UserHoverCard: React.FC<UserHoverCardProps> = ({ username, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    const { data: profileData, isLoading } = useQuery({
        queryKey: queryKeys.hoverProfile(username),
        queryFn: () => userApi.getProfileByUsername(username),
        enabled: isVisible,
        staleTime: 1000 * 60 * 5,
    });

    const user = profileData;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] shadow-none p-4 z-[100] animate-in fade-in zoom-in duration-200">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : user ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <Avatar
                                    src={user.avatar}
                                    username={user.username}
                                    seed={user.uuid}
                                    size="lg"
                                />
                                <button className="px-4 py-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-bold rounded-[8px] hover:opacity-90 transition-colors">
                                    Follow
                                </button>
                            </div>

                            <div>
                                <div className="flex items-center gap-1">
                                    <h4 className="font-bold text-[17px] text-[var(--text-primary)] underline-offset-2 hover:underline cursor-pointer">
                                        {user.fullName}
                                    </h4>
                                    <VerificationBadge isVerified={user.isVerified} verificationType={user.verificationType} className="w-4 h-4" />
                                </div>
                                <p className="text-zinc-500 text-sm">{user.username}</p>
                            </div>

                            {user.bio && <p className="text-sm text-[var(--text-primary)]/90 leading-tight">{user.bio}</p>}

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500 text-[13px]">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Joined {user.createdAt ? format(new Date(user.createdAt), 'MM/yyyy') : 'recently'}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-1">
                                <div className="flex gap-1.5 text-[14px]">
                                    <span className="font-bold text-[var(--text-primary)] font-display">{user.followingCount || 0}</span>
                                    <span className="text-zinc-500 font-medium font-readable">Following</span>
                                </div>
                                <div className="flex gap-1.5 text-[14px]">
                                    <span className="font-bold text-[var(--text-primary)] font-display">{user.followersCount || 0}</span>
                                    <span className="text-zinc-500 font-medium font-readable">Followers</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">No profile information found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserHoverCard;
