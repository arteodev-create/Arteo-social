import React from 'react';
import { Cpu, Globe, Lightning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface PulseMetric {
    label: string;
    value: string;
    change: string;
}

const ArteoIntelligenceInsight: React.FC = () => {
    const { t } = useTranslation();

    const metrics: PulseMetric[] = [
        { label: 'System frequency', value: '1.24 GHz', change: '+5.2%' },
        { label: 'Data flow', value: '842 TB/s', change: '+1.4%' },
        { label: 'Active entities', value: '12,402', change: '+0.8%' }
    ];

    return (
        <div className="flex flex-col border-b border-zinc-100">
            <div className="px-6 py-6">
                <h3 className="text-[17px] font-bold text-black flex items-center gap-2">
                    <Cpu size={20} weight="light" className="text-black" />
                    {t('search.intelligence_insight') || 'Arteo Intelligence Insight'}
                </h3>
            </div>

            <div className="px-6 pb-8">
                <div className="bg-black rounded-[8px] p-6 text-white overflow-hidden relative group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-zinc-800 rounded-[8px] hidden opacity-50 group-hover:opacity-70 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-[8px] animate-pulse" />
                            <span className="text-[11px] font-bold text-zinc-400">Live Arteo Pulse</span>
                        </div>

                        <h4 className="text-[20px] font-extrabold mb-4 leading-tight">
                            The ecosystem is shifting toward technology, AI, and high-signal creator networks.
                        </h4>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {metrics.map((m, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-[10px] text-zinc-500 font-bold mb-1">{m.label}</span>
                                    <span className="text-[15px] font-bold">{m.value}</span>
                                    <span className="text-[10px] text-green-400 font-bold">{m.change}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Globe size={16} weight="light" className="text-zinc-500" />
                                <span className="text-[13px] text-zinc-400">Arteo Social Engine v14.1</span>
                            </div>
                            <button className="bg-white text-black text-[12px] font-bold px-4 py-2 rounded-[8px] hover:bg-zinc-200 transition-colors flex items-center gap-2">
                                <Lightning size={14} weight="fill" />
                                Deep analysis
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArteoIntelligenceInsight;
