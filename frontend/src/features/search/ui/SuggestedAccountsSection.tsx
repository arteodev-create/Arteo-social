import React, { useState } from 'react';
import { UserCircle, MagnifyingGlass, CheckCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@shared/lib';
import { Avatar } from '@shared/ui';

interface SuggestedUser {
    uuid: string;
    username: string;
    fullName: string;
    avatar?: string;
    bio?: string;
    isVerified?: boolean;
}

interface SuggestedAccountsSectionProps {
    users: SuggestedUser[];
    categories?: { id: string, label: string }[];
    isLoading?: boolean;
}

const SuggestedAccountsSection: React.FC<SuggestedAccountsSectionProps> = ({ users, categories = [], isLoading }) => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('for-you');

    const displayCategories = [
        { id: 'for-you', label: t('search.for_you', 'For you') },
        ...categories
    ];

    const filteredUsers = React.useMemo(() => {
        if (activeCategory === 'for-you') return users;
        // Simulate category filtering by shuffling and taking a subset
        return [...users].sort(() => Math.random() - 0.5);
    }, [activeCategory, users]);

    if (isLoading) {
        return null;
    }

    return (
        <div className="flex flex-col border-b border-black">
            <div className="px-6 py-4 flex items-center justify-between border-b border-black">
                <h3 className="text-[17px] font-black text-[var(--text-primary)] flex items-center gap-2">
                    <UserCircle size={20} weight="fill" className="text-[var(--text-primary)]" />
                    {t('search.suggested_accounts', 'Suggested accounts')}
                </h3>
                <div className="w-8 h-8 border border-black bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                    <MagnifyingGlass size={18} weight="bold" />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="px-6 py-5 relative border-b border-[var(--border-primary)]">
                <div className="flex overflow-x-auto no-scrollbar">
                    {displayCategories.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-5 py-2.5 text-[13px] font-black transition-colors border border-r-0 last:border-r whitespace-nowrap",
                                    isActive 
                                        ? "bg-black border-black text-white" 
                                        : "bg-transparent border-black text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                                )}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col">
                {filteredUsers.map((user) => (
                    <div 
                        key={user.uuid} 
                        className="px-6 py-5 flex items-start gap-4 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors border-t border-[var(--border-primary)] first:border-0 group"
                    >
                        <Avatar 
                            src={user.avatar} 
                            username={user.username} 
                            seed={user.uuid}
                            size={48} 
                            className="shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1 min-w-0">
                                        <h4 className="text-[15px] font-bold text-[var(--text-primary)] truncate">{user.fullName || user.username}</h4>
                                        {user.isVerified && (
                                            <CheckCircle size={14} weight="light" className="text-[var(--text-primary)] shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[13px] font-bold text-[var(--text-muted)] truncate">@{user.username}</p>
                                </div>
                                <button className="bg-black text-white border border-black font-black px-5 py-2 text-[13px] transition-colors hover:bg-black">
                                    {t('common.follow', 'Follow')}
                                </button>
                            </div>
                            
                            {user.bio && (
                                <p className="text-[14px] font-bold text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedAccountsSection;
