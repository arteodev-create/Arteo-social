import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminService } from '../../../services/admin.service';

interface OverviewTabProps {
    targetNodeUrl?: string;
    stats: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ targetNodeUrl, stats }) => {
    const { t } = useTranslation();
    const [health, setHealth] = useState<any>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await AdminService.getHealth(targetNodeUrl);
                if (res.success) setHealth(res.data);
            } catch (err) {}
        };
        fetchHealth();
    }, [targetNodeUrl]);

    return (
        <div className="p-0 animate-in fade-in duration-500 bg-black">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                <section className="space-y-16">
                    <div className="space-y-8">
                        <h3 className="text-[12px] font-bold text-zinc-500 border-b border-white/10 pb-4">{t('admin_ui.core_infra')}</h3>
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-1">
                                <span className="text-[64px] font-bold text-white leading-none">{stats?.totalUsers || 0}</span>
                                <p className="text-[13px] text-zinc-400 font-bold">{t('admin_ui.total_users')}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[64px] font-bold text-white leading-none">+{stats?.newUsersToday || 0}</span>
                                <p className="text-[13px] text-zinc-400 font-bold">{t('admin_ui.growth_24h')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-16">
                    <div className="space-y-8">
                        <h3 className="text-[12px] font-bold text-zinc-500 border-b border-white/10 pb-4">{t('admin_ui.system_status')}</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[15px] text-white font-bold">{t('admin_ui.target_node')}</span>
                                <span className="text-[13px] text-white font-bold">
                                    {health?.status === 'ok' ? t('admin_ui.online') : t('admin_ui.offline')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[15px] text-white font-bold">{t('admin_ui.node_url')}</span>
                                <span className="text-[13px] text-white font-bold max-w-[240px] truncate">{targetNodeUrl || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[15px] text-white font-bold">{t('admin_ui.version')}</span>
                                <span className="text-[13px] text-white font-bold">{health?.version || '-'}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};



