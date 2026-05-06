import React, { useEffect, useState } from 'react';
import { HardDrive, Envelope, Database, Pulse } from '@phosphor-icons/react';
import { AdminService } from '../../../services/admin.service';

interface SystemHealthTabProps {
    targetNodeUrl?: string;
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ targetNodeUrl }) => {
    const [health, setHealth] = useState<any>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await AdminService.getHealth(targetNodeUrl);
                if (res.success) {
                    setHealth(res.data);
                }
            } catch (err) {
                console.error('[Health] Failed to fetch signals:', err);
            }
        };
        fetchHealth();
    }, [targetNodeUrl]);

    const getStatusLabel = (status: string) => {
        if (status === 'STABLE') return 'Stable';
        if (status === 'CONNECTED') return 'Connected';
        return status || 'Unknown';
    };

    const getDetailLabel = (key: string) => {
        const labels: Record<string, string> = {
            provider: 'Provider',
            latency: 'Latency',
            usage: 'Usage',
            version: 'Version',
            pool: 'Pool'
        };
        return labels[key] || key;
    };

    const HealthCard = ({ icon: Icon, title, status, details }: any) => (
        <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[8px] flex flex-col gap-8 transition-all hover:border-white/10">
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[8px] bg-white text-black flex items-center justify-center">
                    <Icon size={24} weight="bold" />
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-[8px] ${status === 'STABLE' || status === 'CONNECTED' ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-800'}`} />
                    <span className="text-[12px] font-bold text-white">{getStatusLabel(status)}</span>
                </div>
            </div>
            <div>
                <h4 className="text-[16px] font-bold text-white mb-4">{title}</h4>
                <div className="space-y-3">
                    {Object.entries(details).map(([key, val]: any) => (
                        <div key={key} className="flex justify-between items-center text-[13px]">
                            <span className="text-zinc-500 font-bold">{getDetailLabel(key)}</span>
                            <span className="text-white font-bold">{val || '-'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-0 space-y-12 bg-black animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <HealthCard
                    icon={Envelope}
                    title="Email Infrastructure"
                    status={health?.smtp?.status}
                    details={{ provider: health?.smtp?.provider, latency: health?.smtp?.latency }}
                />
                <HealthCard
                    icon={HardDrive}
                    title="Proxy Storage"
                    status={health?.storage?.status}
                    details={{ provider: health?.storage?.provider, usage: health?.storage?.usage }}
                />
                <HealthCard
                    icon={Database}
                    title="Database"
                    status={health?.database?.status}
                    details={{ pool: health?.database?.pool, version: health?.database?.version }}
                />
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-[8px] p-10">
                <div className="flex items-center gap-4 mb-10">
                    <Pulse size={20} weight="bold" className="text-white" />
                    <h3 className="text-[14px] font-bold text-white">System Event Log</h3>
                </div>
                <div className="space-y-4">
                    {[
                        { time: '10:45:22', event: 'Primary server started', origin: 'arteo-main', type: 'Info' },
                        { time: '10:42:01', event: 'Core data backup completed', origin: 'arteo-main', type: 'Success' },
                        { time: '10:30:15', event: 'Senior admin access granted', origin: 'controller', type: 'Security' }
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-6 text-[13px] p-4 bg-zinc-900/40 rounded-[8px] border border-white/5 transition-colors hover:border-white/10">
                            <span className="text-zinc-600 font-bold">{log.time}</span>
                            <span className="font-bold text-white px-3 py-1 bg-white/10 rounded-[8px] text-[11px]">{log.type}</span>
                            <span className="text-zinc-300 font-bold">{log.event}</span>
                            <span className="ml-auto text-zinc-600 font-bold">@{log.origin}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
