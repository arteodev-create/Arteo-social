import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@shared/ui';

interface UserManagementTabProps {
    users: any[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    fetchUsers: () => void;
    handleUpdateUser: (uuid: string, data: any) => void;
    isLoading: boolean;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
    users,
    searchQuery,
    setSearchQuery,
    fetchUsers,
    handleUpdateUser,
    isLoading
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-black animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-12 shrink-0">
                <div>
                    <h1 className="text-[28px] font-bold text-white mb-1">{t('admin_ui.alliance_citizens')}</h1>
                    <p className="text-[14px] text-zinc-500 font-bold">{t('admin_ui.user_management_desc')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input
                            type="text"
                            placeholder={t('admin_ui.search_users')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="bg-zinc-900/50 border border-white/10 h-11 rounded-[8px] pl-12 pr-6 text-[14px] text-white font-bold outline-none focus:border-white/20 w-[300px] transition-all"
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchUsers} className={`h-11 w-11 text-zinc-500 ${isLoading ? 'animate-spin text-white' : ''}`}>
                        <ArrowClockwise size={18} weight="bold" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-black border-b border-white/10">
                        <tr>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500">{t('admin_ui.user_info')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-center">{t('admin_ui.role')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-center">{t('admin_ui.status')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-right">{t('admin_ui.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((u) => {
                            const isSuspended = u.status === 'SUSPENDED';
                            const statusText = isSuspended ? t('admin_ui.locked') : t('admin_ui.active');
                            const statusClass = isSuspended ? 'text-red-400' : 'text-emerald-400';
                            const dotClass = isSuspended ? 'bg-red-400' : 'bg-emerald-400';

                            return (
                                <tr key={u.uuid} className="group transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                                                {u.avatar ? (
                                                    <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-600 text-[14px]">
                                                        {u.username?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[15px] font-bold text-white leading-none mb-1">{u.fullName || u.username}</span>
                                                <span className="text-[12px] text-zinc-500 font-bold">@{u.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-[8px] border text-[11px] font-bold ${
                                            u.role?.includes('ADMIN')
                                                ? 'bg-white border-white text-black'
                                                : 'bg-zinc-900 border-white/10 text-zinc-400'
                                        }`}>
                                            {u.role === 'ADMIN' ? t('admin_ui.admin') : t('admin_ui.citizen')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-[8px] ${dotClass}`} />
                                            <span className={`text-[12px] font-bold ${statusClass}`}>
                                                {statusText}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            className={`h-9 px-6 rounded-[8px] font-bold text-[11px] transition-all active:scale-95 border ${
                                                isSuspended
                                                    ? 'bg-zinc-900 border-white/15 text-white hover:bg-white hover:text-black'
                                                    : 'bg-zinc-900 border-white/10 text-zinc-300 hover:bg-white hover:text-black'
                                            }`}
                                            onClick={() => handleUpdateUser(u.uuid, { status: isSuspended ? 'ACTIVE' : 'SUSPENDED' })}
                                        >
                                            {isSuspended ? t('admin_ui.unlock') : t('admin_ui.lock')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
