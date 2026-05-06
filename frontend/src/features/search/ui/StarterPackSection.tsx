import React from 'react';
import { SquaresFour, Package } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@shared/ui';

interface StarterPack {
    uuid: string;
    title: string;
    author: string;
    avatars: string[];
    memberCount: number;
}

interface StarterPackSectionProps {
    packs: StarterPack[];
    isLoading?: boolean;
}

const StarterPackSection: React.FC<StarterPackSectionProps> = ({ packs, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="md" label={t('search.loading_packs') || 'Loading starter packs...'} />
            </div>
        );
    }

    return (
        <div className="flex flex-col border-b border-[var(--border-primary)]">
            <div className="px-6 py-6">
                <h3 className="text-[17px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Package size={20} weight="light" className="text-[var(--text-primary)]" />
                    {t('search.starter_packs') || 'Starter packs'}
                </h3>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-4">
                {packs.map((pack) => (
                    <div 
                        key={pack.uuid}
                        className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-6 hover:border-[var(--text-primary)]/20 transition-all group cursor-pointer"
                    >
                        {/* Avatar Grid */}
                        <div className="flex flex-wrap gap-2.5 mb-5">
                            {pack.avatars.slice(0, 11).map((avatar, i) => (
                                <div key={i} className="w-10 h-10 rounded-[8px] border border-[var(--bg-primary)] overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {pack.memberCount > 11 && (
                                <div className="w-10 h-10 rounded-[8px] border border-[var(--bg-primary)] bg-[var(--bg-secondary)] flex items-center justify-center text-[12px] font-bold text-zinc-500">
                                    +{pack.memberCount - 11}
                                </div>
                            )}
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div className="flex flex-col min-w-0">
                                <h4 className="text-[17px] font-bold text-[var(--text-primary)] truncate transition-colors">
                                    {pack.title}
                                </h4>
                                <p className="text-[13px] text-zinc-500 truncate mt-1">
                                    {t('search.by') || 'By'} @{pack.author}
                                </p>
                            </div>
                            <button className="bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold px-6 py-2 rounded-[8px] text-[13px] transition-all whitespace-nowrap shadow-sm">
                                {t('search.open_pack') || 'Open pack'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StarterPackSection;


