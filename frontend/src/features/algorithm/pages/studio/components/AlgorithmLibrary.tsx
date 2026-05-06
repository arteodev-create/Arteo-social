import React from 'react';
import { Icons } from '@shared/ui';
import { cn } from '@shared/lib';
import { useStudioStore } from '../useStudioStore';
import { LoadingSpinner } from '@shared/ui';

const AlgorithmLibrary: React.FC = () => {
    const plugins = useStudioStore(state => state.libraryPlugins);
    const isLoading = useStudioStore(state => state.isLibraryLoading);

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, data: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.setData('application/data', JSON.stringify(data));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-black text-[var(--text-primary)] tracking-tight">
                    Logic Library
                </h3>
                <span className="text-[10px] font-bold text-zinc-400 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[8px] border border-[var(--border-primary)]">
                    {plugins.length} blocks
                </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-bold leading-relaxed pr-4">
                Drag blocks into the canvas to design how data should flow through the algorithm.
            </p>

            {isLoading && plugins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 w-full">
                    <LoadingSpinner size="md" label="Loading intelligence components..." />
                </div>
            ) : plugins.length === 0 ? (
                <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] border-dashed rounded-[8px] flex flex-col items-center justify-center text-center">
                    <Icons.Algorithm size={40} className="text-zinc-500 mb-3" />
                    <span className="text-[12px] font-bold text-zinc-400">Empty</span>
                    <span className="text-[10px] font-semibold text-zinc-500 mt-1 px-4">Create a plugin in Studio to get started</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {plugins.map((block) => {
                        const isBoost = (block.type || block.category || '').toLowerCase().includes('boost');

                        return (
                            <div
                                key={block.uuid || block.id}
                                onDragStart={(event) => onDragStart(event, isBoost ? 'boost' : 'core', block.name, block)}
                                draggable
                                className="group p-3.5 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] cursor-grab flex items-start gap-4 transition-all hover:border-[var(--text-primary)]/10 hover:shadow-none active:scale-95 active:cursor-grabbing"
                            >
                                <div className={cn(
                                    'p-3 rounded-[8px] shrink-0 transition-colors',
                                    isBoost ? 'bg-rose-500/10 text-rose-500' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                                )}>
                                    {isBoost ? <Icons.Boost size={20} /> : <Icons.Algorithm size={18} />}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                                    <span className="text-[14px] font-bold text-[var(--text-primary)] line-clamp-1 tracking-tight">{block.name}</span>
                                    <span className="text-[10px] font-semibold text-zinc-500 line-clamp-2 leading-tight mt-0.5">{block.description || 'Custom logic block'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default React.memo(AlgorithmLibrary);
