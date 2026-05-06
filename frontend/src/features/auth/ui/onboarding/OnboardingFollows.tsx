import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Sparkle } from '@phosphor-icons/react';
import { LoadingSpinner } from '@shared/ui';
import { UserService, CivicService } from '../../../../services';
import { User } from '@entities/user/model';
import { toast } from 'sonner';
import { Button } from '@shared/ui';

interface OnboardingFollowsProps {
    onNext: () => void;
}

const OnboardingFollows: React.FC<OnboardingFollowsProps> = ({ onNext }) => {
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await UserService.getSuggestions(6);
                if (response.success && response.data) {
                    setSuggestions(response.data.users);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    const toggleFollow = async (userId: string) => {
        setActionLoading(userId);
        try {
            const result = await CivicService.toggleFollow(userId);
            const { action } = result.data || result;

            if (action === 'unfollow') {
                setFollowingIds(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            } else {
                setFollowingIds(prev => new Set(prev).add(userId));
            }
        } catch (error) {
            toast.error('Unable to update follow status.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFollowAll = async () => {
        const toFollow = suggestions.filter(u => !followingIds.has(u.uuid));
        if (toFollow.length === 0) {
            onNext();
            return;
        }

        setLoading(true);
        try {
            await Promise.all(toFollow.map(u => CivicService.toggleFollow(u.uuid)));
            onNext();
        } catch (error) {
            toast.error('Something went wrong.');
            setLoading(false);
        }
    };

    if (loading && suggestions.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar space-y-3 px-1">
                {suggestions.map((user) => (
                    <div
                        key={user.uuid}
                        className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-[8px] border border-zinc-900 transition-all hover:border-white/10 hover:bg-zinc-900/60"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-black text-lg">
                                        {user.fullName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-[14px] font-bold text-white truncate">{user.fullName}</h3>
                                <p className="text-[12px] text-zinc-500 truncate font-bold">@{user.username}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => toggleFollow(user.uuid)}
                            disabled={actionLoading === user.uuid}
                            className={`flex-shrink-0 px-5 py-2 rounded-[8px] text-[12px] font-black transition-all ${followingIds.has(user.uuid)
                                    ? 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                        >
                            {actionLoading === user.uuid ? (
                                <LoadingSpinner size="sm" />
                            ) : followingIds.has(user.uuid) ? (
                                <div className="flex items-center gap-1.5">
                                    <UserCheck size={16} weight="bold" />
                                    Following
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <UserPlus size={16} weight="bold" />
                                    Follow
                                </div>
                            )}
                        </button>
                    </div>
                ))}

                {suggestions.length === 0 && (
                    <div className="text-center py-12 space-y-3">
                        <Sparkle size={44} weight="bold" className="mx-auto text-zinc-900" />
                        <p className="text-zinc-600 text-[13px] font-bold">No new suggestions</p>
                    </div>
                )}
            </div>

            <div className="pt-2">
                <Button
                    onClick={handleFollowAll}
                    disabled={loading}
                    loading={loading}
                    variant="primary"
                    className="w-full h-16 rounded-[8px] text-[15px] font-bold"
                >
                    {followingIds.size > 0 || suggestions.length === 0 ? 'Finish' : 'Follow all'}
                </Button>
            </div>
        </div>
    );
};

export default OnboardingFollows;
