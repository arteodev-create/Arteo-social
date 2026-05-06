import React from 'react';
import { Avatar } from '@shared/ui';
import { Text } from '@shared/ui';
import { Button } from '@shared/ui';
import { VerificationBadge } from '../../verification';
import { cn } from '@shared/lib';

interface UserListItemProps {
    user: {
        uuid: string;
        username: string;
        fullName?: string;
        avatar?: string;
        bio?: string;
        isVerified?: boolean;
    };
    onClick?: () => void;
    onFollow?: (e: React.MouseEvent) => void;
    isFollowing?: boolean;
    isLoading?: boolean;
    variant?: 'default' | 'expert';
    className?: string;
}

const UserListItem: React.FC<UserListItemProps> = ({
    user,
    onClick,
    onFollow,
    isFollowing = false,
    isLoading = false,
    variant = 'default',
    className
}) => {
    if (variant === 'expert') {
        return (
            <div
                className={cn(
                    "flex flex-col items-center gap-3 shrink-0 cursor-pointer group animate-in fade-in zoom-in-95 duration-500",
                    className
                )}
                onClick={onClick}
            >
                <div className="relative">
                    <Avatar src={user.avatar} username={user.username} seed={user.uuid} size="lg" className="shadow-sm border border-[var(--border-primary)] group-hover:scale-105 transition-transform duration-500" />
                    {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-[var(--bg-primary)] rounded-[8px] p-0.5 shadow-md">
                            <VerificationBadge isVerified={user.isVerified} size={18} />
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[13px] font-bold text-[var(--text-primary)] text-display truncate max-w-[95px] text-center">
                        {user.fullName || user.username}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                        {user.username}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "px-6 py-6 border-b border-[var(--border-primary)] cursor-pointer flex items-start gap-5 group hover:bg-[var(--bg-secondary)] transition-all animate-in fade-in slide-in-from-left-2 duration-500",
                className
            )}
            onClick={onClick}
        >
            <Avatar src={user.avatar} username={user.username} seed={user.uuid} size="lg" className="group-hover:scale-105 transition-transform duration-500" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="font-bold text-[18px] text-[var(--text-primary)] flex items-center gap-2 text-display">
                            {user.fullName || user.username}
                            <VerificationBadge isVerified={user.isVerified} size={16} />
                        </span>
                        <Text variant="caption" color="muted" className="font-semibold">
                            {user.username}
                        </Text>
                    </div>
                    {onFollow && (
                        <Button
                            size="sm"
                            variant={isFollowing ? "outline" : "primary"}
                            loading={isLoading}
                            className="px-6 rounded-[8px] h-9"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                onFollow(e);
                            }}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    )}
                </div>
                {user.bio && (
                    <Text variant="caption" color="secondary" className="mt-3 line-clamp-2 leading-relaxed">
                        {user.bio}
                    </Text>
                )}
            </div>
        </div>
    );
};

export default UserListItem;
