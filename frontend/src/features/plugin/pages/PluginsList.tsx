import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudArrowDown, DownloadSimple, MagnifyingGlass, SealCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button, Icons, Tabs, TabItem, ConfirmModal, Skeleton } from '@shared/ui';
import { pluginApi } from '@features/plugin/api';
import { queryKeys } from '@shared/lib';
import type { Plugin } from '@features/plugin/model';
import { useAuthStore } from '@entities/session/model';

interface PluginsListHeaderOptions {
    title: React.ReactNode;
    showBackButton?: boolean;
}

const PluginsList: React.FC<{
    renderHeader?: (options: PluginsListHeaderOptions) => React.ReactNode;
}> = ({ renderHeader }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);
    const hasAccessToken = Boolean(token);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pluginToDelete, setPluginToDelete] = useState<Plugin | null>(null);

    const pluginTabs: TabItem[] = [
        { id: 'all', label: 'Explore' },
        { id: 'my', label: 'Owned' },
    ];

    const { data: publicResponse, isLoading: isLoadingPublic } = useQuery({ queryKey: queryKeys.pluginsPublic, queryFn: () => pluginApi.getPublicPlugins() });
    const { data: myResponse, isLoading: isLoadingMy } = useQuery({
        queryKey: queryKeys.pluginsMy,
        queryFn: () => pluginApi.getMyPlugins(),
        enabled: hasAccessToken,
        retry: false
    });

    const extractPlugins = (response?: unknown): Plugin[] => {
        const payload = response as { data?: unknown; plugins?: Plugin[] } | undefined;
        if (!payload) return [];
        if (Array.isArray(payload.data)) return payload.data;
        if (payload.data && typeof payload.data === 'object' && 'plugins' in payload.data) {
            return (payload.data as { plugins?: Plugin[] }).plugins || [];
        }
        return payload.plugins || [];
    };

    const displayPlugins = activeTab === 'all' ? extractPlugins(publicResponse) : (hasAccessToken ? extractPlugins(myResponse) : []);
    const isLoading = activeTab === 'all' ? isLoadingPublic : (hasAccessToken && isLoadingMy);
    const filteredPlugins = displayPlugins.filter((plugin) =>
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const invalidatePlugins = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.plugins }),
            queryClient.invalidateQueries({ queryKey: queryKeys.pluginsMy }),
            queryClient.invalidateQueries({ queryKey: queryKeys.pluginsPublic }),
        ]);
    };

    const handleDeleteConfirm = async () => {
        if (!pluginToDelete) return;
        setProcessingId(pluginToDelete.uuid);
        try {
            await pluginApi.deletePlugin(pluginToDelete.uuid);
            await invalidatePlugins();
        } catch (error) {
            console.error('Failed to delete plugin:', error);
        } finally {
            setProcessingId(null);
            setPluginToDelete(null);
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                {renderHeader?.({
                    title: (
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                                <Icons.Books size={22} weight="light" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[20px] font-black tracking-tight leading-none">Arteo Library</span>
                                <span className="text-[11px] text-[var(--text-muted)] font-bold mt-1">Installable launch-safe extensions</span>
                            </div>
                        </div>
                    ),
                    showBackButton: false
                })}
                <div className="w-full px-6 pt-8 pb-20 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1 max-w-2xl">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <MagnifyingGlass size={18} weight="light" className="text-zinc-500" />
                                </div>
                                <input type="text" placeholder="Search..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] h-12 pl-12 pr-6 text-[14px] font-medium text-[var(--text-primary)] placeholder:text-zinc-500 focus:border-[var(--text-primary)] focus:outline-none transition-all" />
                            </div>
                            <div className="w-[240px]"><Tabs tabs={pluginTabs} activeTab={activeTab} onChange={setActiveTab} /></div>
                        </div>
                        <Button disabled variant="secondary" className="h-12 px-6 rounded-[8px] font-black text-[13px] flex items-center gap-2 shrink-0">
                            Soon
                        </Button>
                    </div>
                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, index) => (
                                        <div key={index} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-6 space-y-4">
                                            <div className="flex items-start justify-between"><Skeleton className="w-14 h-14 rounded-[8px]" /><Skeleton className="w-24 h-8 rounded-[8px]" /></div>
                                            <div className="space-y-2"><Skeleton className="h-6 w-3/4 rounded-[6px]" /><Skeleton className="h-10 w-full rounded-[6px]" /></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredPlugins.length === 0 ? (
                                <div className="py-28 bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)] flex flex-col items-center justify-center text-center px-10 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mb-6 mx-auto"><Icons.Search size={32} weight="thin" className="text-zinc-400" /></div>
                                        <h3 className="text-[22px] font-bold mb-3 tracking-tight">No plugins found</h3>
                                        <p className="text-zinc-500 max-w-sm mx-auto text-[15px] leading-relaxed">Try a different search term or create a custom plugin in Studio.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredPlugins.map((plugin) => (
                                        <motion.div key={plugin.uuid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="group relative bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] p-4 cursor-pointer hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200 flex items-start gap-4 overflow-hidden active:scale-[0.995]" onClick={() => navigate(`/plugins/store/${plugin.uuid}`)}>
                                            <div className="w-12 h-12 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center transition-all duration-200 shrink-0"><Icons.Bird size={24} className="text-[var(--text-primary)]" /></div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <div className="flex items-center gap-1.5 overflow-hidden"><h3 className="text-[16px] font-black text-[var(--text-primary)] truncate">{plugin.name}</h3>{plugin.author?.is_verified && <SealCheck size={14} weight="fill" className="text-[var(--text-primary)] shrink-0" />}</div>
                                                    <Icons.CaretRight size={14} weight="bold" className="text-zinc-300 group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <div className="flex items-center gap-2 mb-2"><span className="text-[11px] text-[var(--text-muted)] font-bold">By @{plugin.author?.username || 'arteo'}</span><span className="w-1 h-1 rounded-[8px] bg-zinc-300" /><span className="text-[11px] text-zinc-400 font-medium">v{plugin.version || '1.0.0'}</span></div>
                                                <p className="text-zinc-500 text-[13px] font-medium leading-relaxed line-clamp-1 group-hover:text-zinc-600 transition-colors">{plugin.description || 'A reusable Arteo intelligence block.'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2" onClick={(event) => event.stopPropagation()}>
                                                <Button
                                                    variant="secondary"
                                                    onClick={async () => {
                                                        setProcessingId(plugin.uuid);
                                                        try {
                                                            await pluginApi.downloadPlugin(plugin.uuid);
                                                            toast.success('Download started');
                                                        } catch {
                                                            toast.error('Unable to download plugin');
                                                        } finally {
                                                            setProcessingId(null);
                                                        }
                                                    }}
                                                    disabled={!!processingId}
                                                    className="h-9 px-3 rounded-[8px] font-bold text-[11px]"
                                                >
                                                    <DownloadSimple size={14} weight="bold" />
                                                    Download
                                                </Button>
                                                {activeTab === 'all' ? (
                                                    <Button
                                                        onClick={async () => {
                                                            setProcessingId(plugin.uuid);
                                                            try {
                                                                await pluginApi.installPlugin(plugin.uuid);
                                                                await invalidatePlugins();
                                                                toast.success('Installed to your Library');
                                                            } catch {
                                                                toast.error('Unable to install plugin');
                                                            } finally {
                                                                setProcessingId(null);
                                                            }
                                                        }}
                                                        disabled={!!processingId}
                                                        className="h-9 px-3 rounded-[8px] font-bold text-[11px]"
                                                    >
                                                        <CloudArrowDown size={14} weight="bold" />
                                                        Install
                                                    </Button>
                                                ) : (
                                                    <Button onClick={() => { setPluginToDelete(plugin); setIsDeleteModalOpen(true); }} disabled={!!processingId} variant="danger" className="h-9 px-3 rounded-[8px] font-bold text-[11px]">Delete</Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete plugin?" description="This action permanently deletes this plugin from your library. Are you sure?" actions={[{ label: 'Confirm delete', variant: 'danger', onClick: () => { if (pluginToDelete) { handleDeleteConfirm(); setIsDeleteModalOpen(false); } } }, { label: 'Cancel', variant: 'cancel', onClick: () => setIsDeleteModalOpen(false) }]} />
        </>
    );
};

export default PluginsList;
