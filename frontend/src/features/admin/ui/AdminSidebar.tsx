import React from 'react';
import {
    Broadcast,
    ChartLineUp,
    Database,
    Gear,
    House,
    ShieldCheck,
    ShieldWarning,
    Siren,
    Users
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    targetNode: { name: string; url: string } | null;
    nodeInfo: any;
    availableTables: string[];
    selectedTable: string;
    setSelectedTable: (table: string) => void;
    resetToLocal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    setActiveTab,
    targetNode,
    availableTables,
    selectedTable,
    setSelectedTable
}) => {
    const navigate = useNavigate();
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: House },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'posts', label: 'Content', icon: ShieldWarning },
        { id: 'reports', label: 'Reports', icon: Siren },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'system', label: 'System', icon: Gear }
    ];

    return (
        <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-stone-200 bg-white">
            <div className="flex items-center gap-3 border-b border-stone-200 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-zinc-950 text-white">
                    <ShieldCheck size={22} weight="bold" />
                </div>
                <div>
                    <div className="text-[15px] font-black leading-none text-zinc-950">Arteo</div>
                    <div className="mt-1 text-[11px] font-bold text-zinc-500">Admin Console</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-7">
                    <div className="mb-3 px-3 text-[11px] font-black uppercase tracking-normal text-zinc-400">Workspace</div>
                    <nav className="space-y-1">
                        {menuItems.slice(0, 4).map((tab) => (
                            <NavButton key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                        ))}
                    </nav>
                </div>

                <div>
                    <div className="mb-3 px-3 text-[11px] font-black uppercase tracking-normal text-zinc-400">Platform</div>
                    <nav className="space-y-1">
                        {menuItems.slice(4).map((tab) => (
                            <div key={tab.id}>
                                <NavButton tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                                {tab.id === 'database' && activeTab === 'database' && availableTables.length > 0 && (
                                    <div className="ml-5 mt-2 space-y-1 border-l border-stone-200 pl-3">
                                        {availableTables.map((table) => (
                                            <button
                                                key={table}
                                                onClick={() => setSelectedTable(table)}
                                                className={`block w-full rounded-[8px] px-3 py-2 text-left text-[12px] font-bold transition ${
                                                    selectedTable === table
                                                        ? 'bg-zinc-950 text-white'
                                                        : 'text-zinc-500 hover:bg-stone-50 hover:text-zinc-950'
                                                }`}
                                            >
                                                {table}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="space-y-3 border-t border-stone-200 p-4">
                <div className="rounded-[8px] border border-stone-200 bg-[#fafafa] p-4">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-black text-zinc-950">
                        <ChartLineUp size={15} weight="bold" />
                        Live Risk
                    </div>
                    <div className="text-[11px] font-bold text-zinc-500">12 escalations queued</div>
                </div>

                <div className="flex items-center gap-3 rounded-[8px] border border-stone-200 bg-[#fafafa] px-4 py-3">
                    <Broadcast size={16} className="text-zinc-500" />
                    <span className="truncate text-[12px] font-bold text-zinc-600">{targetNode?.name || 'Local server'}</span>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="flex w-full items-center gap-3 rounded-[8px] px-4 py-3 text-[13px] font-black text-zinc-600 transition hover:bg-stone-50 hover:text-zinc-950"
                >
                    <House size={18} weight="bold" />
                    Back to app
                </button>
            </div>
        </aside>
    );
};

const NavButton = ({ tab, activeTab, setActiveTab }: any) => {
    const active = activeTab === tab.id;
    return (
        <button
            onClick={() => setActiveTab(tab.id)}
            className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-[13px] font-black transition active:scale-[0.98] ${
                active
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:bg-stone-50 hover:text-zinc-950'
            }`}
        >
            <tab.icon size={18} weight={active ? 'fill' : 'bold'} />
            {tab.label}
        </button>
    );
};
