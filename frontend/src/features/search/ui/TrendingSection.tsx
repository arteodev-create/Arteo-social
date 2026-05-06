import React from 'react';
import { CaretRight, Flame } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@shared/ui';

interface TrendingTopic {
    title: string;
    category: string;
    postCount: string | number;
    description?: string;
    userSamples?: string[];
    timeAgo?: string;
}

interface TrendingSectionProps {
    topics: TrendingTopic[];
    isLoading?: boolean;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ topics, isLoading }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (isLoading) {
        return null;
    }

    const handleTopicClick = (title: string) => {
        const query = title.startsWith('#') ? title : `#${title}`;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="flex flex-col border-b border-black">
            <div className="px-6 py-4 flex items-center justify-between border-b border-black group cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex flex-col">
                    <h3 className="text-[17px] font-black text-[var(--text-primary)] flex items-center gap-2">
                        <div className="w-7 h-7 flex items-center justify-center border border-black bg-[var(--bg-primary)] text-[var(--text-primary)]">
                            <Flame size={15} weight="bold" />
                        </div>
                        {t('search.interests_title', 'Interests')}
                    </h3>
                    <p className="text-[13px] font-bold text-[var(--text-muted)] mt-0.5">
                        {t('search.interests_subtitle', 'Topics shaping the network')}
                    </p>
                </div>
                <CaretRight size={18} weight="bold" className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>

            <div className="flex flex-col">
                {topics.length === 0 ? (
                    <div className="px-6 py-6 border-t border-[var(--border-primary)]">
                        <p className="text-[13px] font-bold text-[var(--text-muted)]">
                            {t('search.no_trending_topics', 'No trending topics yet')}
                        </p>
                    </div>
                ) : topics.map((topic, index) => (
                    <div 
                        key={index} 
                        onClick={() => handleTopicClick(topic.title)}
                        className="px-6 py-5 flex items-start gap-4 hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors border-t border-[var(--border-primary)] group select-none"
                    >
                        <span className="text-[14px] font-black text-[var(--text-muted)] mt-0.5 group-hover:text-[var(--text-primary)] transition-colors">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-[16px] font-black text-[var(--text-primary)] truncate">{topic.title.startsWith('#') ? topic.title : topic.title}</h4>
                                {topic.timeAgo && (
                                    <span className="text-[12px] font-bold text-[var(--text-muted)] whitespace-nowrap">{topic.timeAgo}</span>
                                )}
                                {index === 0 && (
                                    <span className="px-2.5 py-1 border border-black bg-[var(--bg-primary)] text-[var(--text-primary)] text-[10px] font-black flex items-center gap-1 shrink-0">
                                        <Flame size={12} weight="fill" />
                                        {t('common.featured', 'Featured')}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                {topic.userSamples && topic.userSamples.length > 0 && (
                                    <div className="flex -space-x-2 mr-1">
                                        {topic.userSamples.map((avatar, i) => (
                                            <Avatar 
                                                key={i} 
                                                src={avatar} 
                                                size={22} 
                                            className="border border-[var(--bg-primary)] shrink-0" 
                                            />
                                        ))}
                                    </div>
                                )}
                                <span className="text-[13px] text-[var(--text-muted)] font-bold">{topic.category}</span>
                            </div>
                        </div>
                        <CaretRight size={18} weight="bold" className="text-[var(--text-muted)] mt-2 opacity-100" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingSection;
