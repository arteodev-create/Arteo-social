import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestedUsers } from '@entities/user';
import { Avatar } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib';
import { VerificationBadge } from '../../verification';

const UserAvatarList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: rawSuggestions = [], isLoading } = useSuggestedUsers(20);
    
    // Shuffle logic to ensure randomness on every entry
    const suggestions = React.useMemo(() => {
        if (rawSuggestions.length === 0) return [];
        const shuffled = [...rawSuggestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[shuffled[i]] ? shuffled[j] : shuffled[i]]; // Placeholder for safe swap
            // Real Fisher-Yates:
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }, [rawSuggestions]);

    if (isLoading && suggestions.length === 0) {
        return (
            <div className="flex items-center gap-6 px-6 py-6 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                        <div className="w-[68px] h-[68px] rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)]" />
                        <div className="w-12 h-2.5 bg-[var(--bg-secondary)] rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (suggestions.length === 0) return null;

    return (
        <div className="relative bg-[var(--bg-primary)]/80 backdrop-blur-md z-20 overflow-hidden">
            <div 
                className="flex items-center gap-6 px-6 py-6 overflow-x-auto no-scrollbar scroll-smooth"
            >
                {suggestions.map((user) => (
                    <div
                        key={user.uuid}
                        onClick={() => navigate(`/${user.username}`)}
                        className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 transition-transform active:scale-95"
                    >
                        <div className="relative">
                            <div className="relative rounded-[8px] bg-[var(--bg-primary)] transition-all duration-300">
                                <Avatar 
                                    src={user.avatar} 
                                    username={user.username} 
                                    seed={user.uuid}
                                    className="w-[64px] h-[64px] transition-all duration-300"
                                />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--bg-primary)] rounded-[8px] p-0.5 shadow-sm">
                                <VerificationBadge
                                    isVerified={user.isVerified}
                                    verificationType={user.verificationType}
                                    size={18}
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500 group-hover:text-[var(--text-primary)] transition-colors max-w-[70px] truncate text-center">
                            {user.fullName?.split(' ')[0] || user.username}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAvatarList;


