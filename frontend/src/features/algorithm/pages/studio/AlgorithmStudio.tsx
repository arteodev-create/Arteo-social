import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@shared/ui';
import { Icons } from '@shared/ui';
import { ConfirmModal } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';
import { cn } from '@shared/lib';
import { algorithmApi } from '@features/algorithm/api';

import { useStudioStore } from './useStudioStore';
import AlgorithmCode from './components/AlgorithmCode';
import AlgorithmCanvas from './components/AlgorithmCanvas';
import AlgorithmLibrary from './components/AlgorithmLibrary';

const AlgorithmStudio = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        activeView,
        sidebarTab,
        metadata,
        nodes,
        selectedNodeId,
        isLoading,
        saveStatus,
        fetchAlgorithm,
        fetchLibraryPlugins,
        saveAlgorithm,
        resetStudio,
        setMetadata,
        setActiveView,
        setSidebarTab,
    } = useStudioStore();

    const [showSidebar, setShowSidebar] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (id) fetchAlgorithm(id);
        else resetStudio();
        fetchLibraryPlugins();
    }, [id, fetchAlgorithm, fetchLibraryPlugins, resetStudio]);

    useEffect(() => {
        const draft = {
            nodes: useStudioStore.getState().nodes,
            edges: useStudioStore.getState().edges,
            metadata: useStudioStore.getState().metadata,
            timestamp: Date.now(),
        };
        localStorage.setItem(`algorithm_draft_${id || 'new'}`, JSON.stringify(draft));
    }, [nodes, metadata, id]);

    const handleSave = async () => {
        const result = await saveAlgorithm();
        if (result.success) {
            toast.success(t('studio.save_success', 'Algorithm saved'));
            if (!id && result.data?.uuid) {
                navigate(`/algorithms/studio/${result.data.uuid}`, { replace: true });
            }
        } else {
            toast.error(t('studio.save_failed', 'Unable to save algorithm'));
        }
    };

    const confirmDelete = async () => {
        if (!id) return;
        try {
            const res = await algorithmApi.deleteAlgorithm(id);
            if (res.success) {
                toast.success(t('studio.delete_success', 'Algorithm deleted'));
                navigate('/algorithms');
            } else {
                toast.error(t('studio.delete_failed', 'Unable to delete algorithm'));
            }
        } catch {
            toast.error(t('studio.delete_error', 'Unable to delete algorithm'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-[var(--bg-primary)]">
                <LoadingSpinner size="lg" label="Initializing Intelligence Studio..." />
            </div>
        );
    }

    const selectedNode = nodes.find(node => node.id === selectedNodeId);

    return (
        <>
            <Helmet>
                <title>{t('studio.title', 'Algorithm Studio')}</title>
            </Helmet>

            <div className="flex-1 flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium relative h-full">
                <header className="h-[72px] shrink-0 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-center justify-between px-8 z-[100]">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/algorithms')}
                            className="w-10 h-10 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]/80 transition-colors"
                        >
                            <Icons.Arrow size={16} weight="bold" className="text-[var(--text-primary)]" />
                        </Button>

                        <div className="flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-5 py-2.5 rounded-[8px] shadow-sm cursor-default">
                            <div className="w-8 h-8 rounded-[8px] bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-md">
                                <Icons.Algorithm size={18} weight="light" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[15px] font-black tracking-tight text-[var(--text-primary)] leading-none">
                                        {t('studio.header_title', 'Algorithm Studio')}
                                    </h1>
                                    <span className="bg-[var(--bg-primary)] text-[var(--text-primary)] px-2.5 py-0.5 rounded-[8px] text-[9px] font-bold border border-[var(--border-primary)] shadow-sm">
                                        v{metadata.version}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 mt-0.5 max-w-[200px] truncate leading-none">
                                    {metadata.name}
                                </span>
                            </div>
                        </div>

                        <div className="ml-8 flex items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-1.5 shadow-inner">
                            <button
                                onClick={() => setActiveView('canvas')}
                                className={cn(
                                    'flex items-center gap-2 px-6 py-2 rounded-[8px] text-[12px] font-bold transition-all duration-300',
                                    activeView === 'canvas'
                                        ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-md border border-[var(--border-primary)]'
                                        : 'text-zinc-500 hover:text-[var(--text-primary)]'
                                )}
                            >
                                <Icons.Selection size={16} />
                                <span>Canvas Design</span>
                            </button>
                            <button
                                onClick={() => setActiveView('code')}
                                className={cn(
                                    'flex items-center gap-2 px-6 py-2 rounded-[8px] text-[12px] font-bold transition-all duration-300',
                                    activeView === 'code'
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-md'
                                        : 'text-zinc-500 hover:text-[var(--text-primary)]'
                                )}
                            >
                                <Icons.Selection size={14} />
                                <span>Logic Code</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {id && (
                            <Button
                                variant="ghost"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-5 h-10 rounded-[8px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all flex items-center gap-2 font-bold text-[12px]"
                            >
                                <Icons.Trash size={16} weight="bold" />
                                <span>Delete</span>
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={saveStatus === 'saving'}
                            variant="primary"
                            className="px-6 h-10 rounded-[8px] flex items-center gap-2 text-[13px] shadow-none"
                        >
                            {saveStatus === 'saved' ? <Icons.Check size={18} weight="bold" /> : <Icons.Share size={18} weight="bold" />}
                            <span>{saveStatus === 'saved' ? t('studio.saved', 'Saved') : t('studio.save', 'Save')}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={cn(
                                'w-10 h-10 rounded-[8px] border transition-all',
                                showSidebar
                                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-secondary)]'
                                    : 'bg-[var(--bg-primary)] text-zinc-400 border-[var(--border-primary)]'
                            )}
                        >
                            <Icons.Sidebar size={22} weight="bold" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden w-full relative bg-zinc-50/50 justify-center">
                    <div className="flex-1 max-w-[1000px] h-full relative flex flex-col p-1.5 overflow-hidden">
                        {activeView === 'code' ? <AlgorithmCode /> : <AlgorithmCanvas />}
                    </div>

                    {showSidebar && (
                        <aside className="w-[360px] shrink-0 border-l border-[var(--border-primary)] bg-[var(--bg-primary)] h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
                            <div className="flex items-center w-full px-6 pt-6 pb-2">
                                <div className="flex w-full items-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-1.5">
                                    <button
                                        onClick={() => setSidebarTab('library')}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold transition-all duration-300',
                                            sidebarTab === 'library'
                                                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-md border border-[var(--border-primary)]'
                                                : 'text-zinc-500 hover:text-[var(--text-primary)]'
                                        )}
                                    >
                                        <Icons.Quote size={14} />
                                        Library
                                    </button>
                                    <button
                                        onClick={() => setSidebarTab('settings')}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold transition-all duration-300',
                                            sidebarTab === 'settings'
                                                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-md border border-[var(--border-primary)]'
                                                : 'text-zinc-500 hover:text-[var(--text-primary)]'
                                        )}
                                    >
                                        <Icons.Edit size={14} />
                                        Settings
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-4 space-y-8">
                                {sidebarTab === 'library' ? (
                                    <AlgorithmLibrary />
                                ) : (
                                    <>
                                        {selectedNode && (
                                            <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 pb-8 border-b border-[var(--border-primary)]">
                                                <div className="flex items-center gap-2">
                                                    <Icons.Edit size={18} weight="bold" className="text-[var(--text-primary)]" />
                                                    <h3 className="text-[14px] font-bold text-[var(--text-primary)]">Block Configuration</h3>
                                                </div>
                                                <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] space-y-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[12px] font-bold text-zinc-500">Display label</label>
                                                        <input
                                                            type="text"
                                                            value={selectedNode.data.label}
                                                            onChange={event => useStudioStore.getState().updateNodeData(selectedNode.id, { label: event.target.value })}
                                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all shadow-sm"
                                                        />
                                                    </div>

                                                    {selectedNode.data.isBoost ? (
                                                        <div className="space-y-2">
                                                            <label className="text-[12px] font-bold text-zinc-500">Weight</label>
                                                            <input
                                                                type="number"
                                                                value={selectedNode.data.weight || 50}
                                                                onChange={event => useStudioStore.getState().updateNodeData(selectedNode.id, { weight: parseInt(event.target.value, 10) || 0 })}
                                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <label className="text-[12px] font-bold text-zinc-500">Criterion</label>
                                                            <input
                                                                type="text"
                                                                value={selectedNode.data.criterion || 'nsfw'}
                                                                onChange={event => useStudioStore.getState().updateNodeData(selectedNode.id, { criterion: event.target.value })}
                                                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    )}

                                                    <p className="pt-4 border-t border-zinc-200/50 text-[11px] font-semibold text-zinc-400 italic leading-relaxed">
                                                        {selectedNode.data.description || 'Adjust parameters here to update the generated source logic.'}
                                                    </p>
                                                </div>
                                            </section>
                                        )}

                                        <section className="space-y-4">
                                            <div className="w-12 h-12 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] shadow-sm flex items-center justify-center shrink-0">
                                                <Icons.Algorithm size={28} className="text-[var(--text-primary)]" />
                                            </div>
                                            <h3 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                Configuration Metadata
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-zinc-500">Algorithm name</label>
                                                    <input
                                                        type="text"
                                                        value={metadata.name}
                                                        onChange={event => setMetadata({ name: event.target.value })}
                                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all"
                                                        placeholder="New algorithm name..."
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-zinc-500">Version</label>
                                                    <input
                                                        type="text"
                                                        value={metadata.version}
                                                        onChange={event => setMetadata({ version: event.target.value })}
                                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-zinc-500">System description</label>
                                                    <textarea
                                                        value={metadata.description}
                                                        onChange={event => setMetadata({ description: event.target.value })}
                                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-3 text-[13px] font-semibold text-[var(--text-secondary)] min-h-[100px] resize-none focus:outline-none focus:border-[var(--text-primary)] transition-all"
                                                        placeholder="Describe what this algorithm does..."
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-zinc-500">Tags (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={metadata.tags.join(', ')}
                                                        onChange={event => setMetadata({ tags: event.target.value.split(',').map(tag => tag.trim()) })}
                                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] px-4 py-2.5 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all"
                                                        placeholder="core, discovery, boost..."
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <h3 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                <Icons.PushPin size={18} weight="bold" className="text-zinc-400" />
                                                Access Rules
                                            </h3>
                                            <div
                                                className="p-4 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-primary)] cursor-pointer flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-all"
                                                onClick={() => setMetadata({ is_public: !metadata.is_public })}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">Publish publicly</span>
                                                    <span className="text-[11px] font-semibold text-zinc-500 mt-0.5">Anyone can install it</span>
                                                </div>
                                                <div className={cn('w-10 h-5 rounded-[8px] p-0.5 transition-all', metadata.is_public ? 'bg-[var(--text-primary)]' : 'bg-zinc-200')}>
                                                    <div className={cn('w-4 h-4 rounded-[8px] bg-[var(--bg-primary)] transition-all transform', metadata.is_public ? 'translate-x-5' : 'translate-x-0')} />
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('studio.delete_confirm_title', 'Delete this algorithm?')}
                description={t('studio.delete_confirm_desc', 'This action permanently removes the algorithm from your library.')}
                actions={[
                    {
                        label: t('studio.confirm_delete', 'Confirm delete'),
                        variant: 'danger',
                        onClick: confirmDelete,
                    },
                    {
                        label: t('common.cancel', 'Cancel'),
                        variant: 'cancel',
                        onClick: () => setIsDeleteModalOpen(false),
                    },
                ]}
            />
        </>
    );
};

export default AlgorithmStudio;
