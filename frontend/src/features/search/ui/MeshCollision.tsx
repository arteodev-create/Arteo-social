import React from 'react';
import { Lightning, ArrowsMerge } from '@phosphor-icons/react';
import { Icons } from '@shared/ui';

interface MeshCollisionProps {
    trendingTopics: any[];
    isLoading?: boolean;
}

const MeshCollision: React.FC<MeshCollisionProps> = ({ trendingTopics, isLoading }) => {
    if (isLoading || trendingTopics.length < 2) return null;

    const topicA = trendingTopics[0];
    const topicB = trendingTopics[1];

    return (
        <div className="flex flex-col border-b border-[var(--border-primary)]">
            <div className="px-6 py-6 flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Icons.Butterfly size={20} weight="thin" className="text-[var(--text-primary)]" />
                    Trend collision
                </h3>
                <div className="group relative">
                    <Icons.Info size={18} weight="light" className="text-zinc-400 cursor-help hover:text-[var(--text-primary)] transition-colors" />
                    <div className="absolute right-0 top-8 w-64 p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] shadow-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        <p className="text-[12px] text-zinc-500 leading-relaxed">
                            <span className="text-[var(--text-primary)] font-bold">Trend collision</span> highlights connections between topics that look unrelated, giving you a sharper angle on what is moving right now.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-8">
                <div className="relative h-56 bg-black rounded-[8px] overflow-hidden group cursor-pointer shadow-none">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-transparent" />
                        <div className="absolute bottom-0 right-0 w-full h-full bg-transparent" />
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex flex-col items-center">
                                <span className="text-[24px] font-black text-white tracking-tighter">{topicA.title}</span>
                            </div>
                            <div className="w-10 h-10 rounded-[8px] bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:rotate-180 transition-transform duration-700">
                                <ArrowsMerge size={20} weight="light" />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[24px] font-black text-white tracking-tighter">{topicB.title}</span>
                            </div>
                        </div>

                        <p className="text-[14px] text-zinc-400 max-w-[320px] mb-6 leading-relaxed">
                            Explore the overlap between <span className="text-white font-bold">{topicA.title}</span> and <span className="text-white font-bold">{topicB.title}</span>.
                        </p>

                        <button className="bg-white text-black text-[13px] font-bold px-8 py-3 rounded-[8px] hover:scale-105 transition-all flex items-center gap-2 shadow-none">
                            <Lightning size={16} weight="fill" />
                            Explore now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeshCollision;
