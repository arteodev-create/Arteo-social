import React from 'react';
import {
    Users,
    Globe,
    Pulse,
    ShieldCheck
} from '@phosphor-icons/react';

interface AdminStatsCardsProps {
    stats: any;
    nodesCount: number;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, nodesCount }) => {
    const statItems = [
        { label: 'Total users', value: stats?.users || '0', icon: Users },
        { label: 'Federated nodes', value: nodesCount, icon: Globe },
        { label: 'Status', value: 'Operational', icon: Pulse },
        { label: 'Security', value: 'Protected', icon: ShieldCheck }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {statItems.map((s, i) => (
                <div key={i} className="bg-black border-b border-white/10 pb-8 flex flex-col gap-2 transition-all hover:border-white/20">
                    <span className="text-[13px] font-bold text-zinc-500">{s.label}</span>
                    <div className="flex items-center justify-between">
                        <span className="text-[36px] font-bold text-white tracking-tight">{s.value}</span>
                        <s.icon size={24} weight="bold" className="text-white/20" />
                    </div>
                </div>
            ))}
        </div>
    );
};
