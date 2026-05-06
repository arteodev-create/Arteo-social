import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlass, Plus, SealCheck } from '@phosphor-icons/react';
import { Button, Icons, Tabs, TabItem, ConfirmModal, Skeleton } from '@shared/ui';
import { algorithmApi } from '@features/algorithm/api';
import { useAuth } from '@entities/session/model';
import { queryKeys } from '@shared/lib';

interface AlgorithmsListHeaderOptions {
    title: React.ReactNode;
    showBackButton?: boolean;
}

const AlgorithmsList: React.FC<{
    renderHeader?: (options: AlgorithmsListHeaderOptions) => React.ReactNode;
}> = ({ renderHeader }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [algoToDelete, setAlgoToDelete] = useState<any>(null);
    const [pendingAlgo, setPendingAlgo] = useState<any>(null);

    const algoTabs: TabItem[] = [
        { id: 'all', label: 'Explore' },
        { id: 'my', label: 'Owned' },
    ];

    const { data: publicResponse, isLoading: isLoadingPublic } = useQuery({
        queryKey: queryKeys.algorithmsPublic,
        queryFn: () => algorithmApi.getPublicAlgorithms(),
    });

    const { data: myResponse, isLoading: isLoadingMy } = useQuery({
        queryKey: queryKeys.algorithmsMy,
        queryFn: () => algorithmApi.getAllAlgorithms(),
    });

    const extractAlgos = (response: any) => {
        if (!response) return [];
        return response.data?.algorithms || response.algorithms || (Array.isArray(response.data) ? response.data : []);
    };

    const publicAlgos = extractAlgos(publicResponse);
    const myAlgos = extractAlgos(myResponse);
    const isLoading = activeTab === 'all' ? isLoadingPublic : isLoadingMy;
    const currentPins = myAlgos.filter((a: any) => a.isPinned).sort((a: any, b: any) => a.pinOrder - b.pinOrder);

    const algorithms = activeTab === 'all'
        ? publicAlgos.filter((pa: any) => {
            const isMine = pa.userId === user?.uuid;
            const alreadyInstalled = myAlgos.some((ma: any) =>
                ma.installedFromId === pa.uuid || ma.uuid === pa.uuid || ma.name === pa.name
            );
            return !isMine && !alreadyInstalled;
        })
        : myAlgos;

    const filteredAlgorithms = algorithms.filter((algo: any) =>
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const invalidateAlgorithms = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.algorithms }),
            queryClient.invalidateQueries({ queryKey: queryKeys.algorithmsMy }),
            queryClient.invalidateQueries({ queryKey: queryKeys.algorithmsPublic }),
        ]);
    };

    const handleDeleteConfirm = async () => {
        if (!algoToDelete) return;
        setProcessingId(algoToDelete.uuid);
        try {
            await algorithmApi.deleteAlgorithm(algoToDelete.uuid);
            await invalidateAlgorithms();
        } finally {
            setProcessingId(null);
            setAlgoToDelete(null);
        }
    };

    const handlePin = async (algo: any) => {
        setProcessingId(algo.uuid);
        try {
            await algorithmApi.pinAlgorithm(algo.uuid);
            await invalidateAlgorithms();
        } catch (err: any) {
            const errorData = err.response?.data;
            const msg = typeof errorData === 'string'
                ? errorData
                : (errorData?.error || errorData?.message || err.message || '');
            const errorString = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
            if (errorString.includes('maximum 3')) {
                setPendingAlgo(algo);
                setIsLimitModalOpen(true);
            } else {
                console.error('Pin error:', errorString);
            }
        } finally {
            setProcessingId(null);
        }
    };

    const handleUnpin = async (uuid: string) => {
        setProcessingId(uuid);
        try {
            await algorithmApi.unpinAlgorithm(uuid);
            await invalidateAlgorithms();
        } finally {
            setProcessingId(null);
        }
    };

    const handleReplacePin = async (oldAlgoId: string) => {
        if (!pendingAlgo) return;
        setProcessingId(pendingAlgo.uuid);
        setIsLimitModalOpen(false);
        try {
            await algorithmApi.unpinAlgorithm(oldAlgoId);
            await algorithmApi.pinAlgorithm(pendingAlgo.uuid);
            await invalidateAlgorithms();
        } finally {
            setProcessingId(null);
            setPendingAlgo(null);
        }
    };

    return (
        <>
            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                {renderHeader?.({
                    title: (
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                                <Icons.Butterfly size={22} weight="thin" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[20px] font-black tracking-tight leading-none">Intelligence</span>
                                <span className="text-[11px] text-[var(--text-muted)] font-bold mt-1">Arteo Algorithm Management</span>
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
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] h-12 pl-12 pr-6 text-[14px] font-medium text-[var(--text-primary)] placeholder:text-zinc-500 focus:border-[var(--text-primary)] focus:outline-none transition-all"
                                />
                            </div>
                            <div className="w-[240px]">
                                <Tabs tabs={algoTabs} activeTab={activeTab} onChange={setActiveTab} />
                            </div>
                        </div>

                        <Button
                            disabled
                            className="h-12 px-6 rounded-[8px] font-black text-[13px] bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0 text-platinum-glow"
                        >
                            <Plus size={16} weight="bold" />
                            New design · Soon
                        </Button>
                    </div>

                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...Array(6)].map((_, index) => (
                                        <div key={index} className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-6 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <Skeleton className="w-14 h-14 rounded-[8px]" />
                                                <Skeleton className="w-20 h-8 rounded-[8px]" />
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-3/4 rounded-[6px]" />
                                                <Skeleton className="h-4 w-full rounded-[6px]" />
                                                <Skeleton className="h-4 w-1/2 rounded-[6px]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredAlgorithms.length === 0 ? (
                                <div className="py-28 bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)] flex flex-col items-center justify-center text-center px-10 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center mb-6 mx-auto">
                                            <Icons.Search size={36} weight="thin" className="text-zinc-400" />
                                        </div>
                                        <h3 className="text-[22px] font-bold mb-3 tracking-tight">No algorithms found</h3>
                                        <p className="text-zinc-500 max-w-sm mx-auto text-[15px] leading-relaxed">
                                            Try a different search term or design a custom algorithm for your system.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredAlgorithms.map((algo: any) => (
                                        <motion.div
                                            key={algo.uuid}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="group relative bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] p-4 cursor-pointer hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200 flex items-start gap-4 overflow-hidden active:scale-[0.995]"
                                            onClick={() => navigate(`/algorithms/${algo.uuid}`)}
                                        >
                                            <div className="w-12 h-12 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center transition-all duration-200 shrink-0">
                                                <Icons.Butterfly size={24} weight="thin" className="text-[var(--text-primary)]" />
                                            </div>

                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <h3 className="text-[16px] font-black text-[var(--text-primary)] truncate">{algo.name}</h3>
                                                        {algo.user?.is_verified && <SealCheck size={14} weight="fill" className="text-[var(--text-primary)] shrink-0" />}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {algo.isPinned && (
                                                            <div className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-[9px] px-2 py-0.5 rounded-[6px] font-black">
                                                                RANK #{algo.pinOrder}
                                                            </div>
                                                        )}
                                                        <Icons.CaretRight size={14} weight="bold" className="text-zinc-300 group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[11px] text-[var(--text-muted)] font-bold">By @{algo.user?.username || 'arteo'}</span>
                                                    <span className="w-1 h-1 rounded-[8px] bg-zinc-300" />
                                                    <span className="text-[11px] text-zinc-400 font-medium">v{algo.version || '1.0.0'}</span>
                                                </div>

                                                <p className="text-zinc-500 text-[13px] font-medium leading-relaxed line-clamp-1 group-hover:text-zinc-600 transition-colors">
                                                    {algo.description || 'An algorithm configuration that powers a personalized Arteo feed.'}
                                                </p>
                                            </div>

                                            {activeTab === 'my' && (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <Button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            algo.isPinned ? handleUnpin(algo.uuid) : handlePin(algo);
                                                        }}
                                                        disabled={!!processingId}
                                                        className={`h-9 px-4 rounded-[8px] font-bold text-[11px] transition-all ${
                                                            algo.isPinned
                                                                ? 'bg-[var(--bg-primary)] text-zinc-500 border border-[var(--border-primary)]'
                                                                : 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                                        }`}
                                                    >
                                                        {algo.isPinned ? 'Unpin' : 'Pin'}
                                                    </Button>
                                                    <Button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setAlgoToDelete(algo);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        disabled={!!processingId}
                                                        className="h-9 px-4 rounded-[8px] font-bold text-[11px] bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isLimitModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLimitModalOpen(false)} className="absolute inset-0 bg-black/60 " />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-[400px] bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] p-8 shadow-none space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">Pinned limit reached (3/3)</h3>
                                <p className="text-[14px] text-zinc-500 font-medium">You already pinned 3 algorithms. Choose one to replace:</p>
                            </div>
                            <div className="space-y-3">
                                {currentPins.map((p: any) => (
                                    <button key={p.uuid} onClick={() => handleReplacePin(p.uuid)} className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)] hover:border-[var(--text-primary)]/20 transition-all text-left group">
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-bold text-[var(--text-primary)]">{p.name}</span>
                                            <span className="text-[12px] text-zinc-500">Pinned at position #{p.pinOrder}</span>
                                        </div>
                                        <Icons.Arrow size={16} className="text-zinc-500 group-hover:text-[var(--text-primary)]" />
                                    </button>
                                ))}
                            </div>
                            <Button onClick={() => setIsLimitModalOpen(false)} className="w-full h-12 rounded-[8px] bg-[var(--bg-secondary)] text-zinc-500 font-bold text-[13px] border border-[var(--border-primary)]">Cancel</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete algorithm?"
                description="This action permanently deletes this algorithm from your library. Are you sure?"
                actions={[
                    { label: 'Confirm delete', variant: 'danger', onClick: handleDeleteConfirm },
                    { label: 'Cancel', variant: 'cancel', onClick: () => setIsDeleteModalOpen(false) },
                ]}
            />
        </>
    );
};

export default AlgorithmsList;
