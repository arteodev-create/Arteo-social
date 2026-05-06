import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    SealCheck,
    Clock,
    CloudArrowDown,
    ShareNetwork,
    Gear,
    CaretLeft,
    Tag,
    UserCircle,
    CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { Icons } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';
import { SEO } from '@shared/ui';
import { algorithmApi } from '@features/algorithm/api';
import { useAuth } from '@entities/session/model';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import { queryKeys } from '@shared/lib';
const AlgorithmDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { activeAlgoUuid, algorithms, refreshAlgorithms } = useAlgorithms();
    const [isInstalling, setIsInstalling] = useState(false);

    const { data: response, isLoading, error } = useQuery({
        queryKey: queryKeys.algorithm(id),
        queryFn: () => algorithmApi.getAlgorithmById(id!),
        enabled: !!id
    });

    const algo = response?.data || response;

    const isOwner = algo?.userId === user?.uuid;
    

    const personalRecord = algorithms.find((a: any) => 
        a.uuid === id || a.installedFromId === id
    );

    const isInstalled = !!personalRecord;
    const isActive = activeAlgoUuid === personalRecord?.uuid || activeAlgoUuid === id;

    const handleInstall = async () => {
        if (!id || isActive) return;
        setIsInstalling(true);
        try {
            await algorithmApi.setActiveAlgorithm(id);
            toast.success('Algorithm activated successfully');
            await queryClient.invalidateQueries({ queryKey: queryKeys.algorithms });
            await refreshAlgorithms();
        } catch (err) {
            toast.error('Unable to activate algorithm');
        } finally {
            setIsInstalling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
                <LoadingSpinner size="xl" label="Arteo is processing intelligence data..." />
            </div>
        );
    }

    if (error || !algo) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center px-10">
                    <div className="w-20 h-20 rounded-[8px] bg-[var(--bg-secondary)] flex items-center justify-center mb-8">
                        <Icons.Search size={36} weight="thin" className="text-zinc-400" />
                    </div>
                    <h3 className="text-[22px] font-bold mb-3 tracking-tight">Algorithm not found</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto text-[15px] leading-relaxed mb-8">
                        This algorithm may have been removed or you may not have access.
                    </p>
                    <Button onClick={() => navigate('/algorithms')} variant="primary" className="rounded-[8px] px-8 h-12">
                        Back to library
                    </Button>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={algo.name}
                description={algo.description || 'An Arteo feed algorithm for personalized social discovery.'}
                keywords={`Arteo, algorithm, feed ranking, ${Array.isArray(algo.tags) ? algo.tags.join(', ') : 'social discovery'}`}
                type="article"
            />

            <div className="bg-[var(--bg-primary)] min-h-screen">
                <div className="w-full px-8 py-12 space-y-12">
                    {/* Navigation */}
                    <button 
                        onClick={() => navigate('/algorithms')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-[var(--text-primary)] transition-colors font-bold text-[14px] group"
                    >
                        <CaretLeft size={18} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
                        Back to library
                    </button>

                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-32 h-32 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shadow-none shadow-black/5 shrink-0"
                        >
                            <Icons.Butterfly size={56} weight="thin" className="text-[var(--text-primary)]" />
                        </motion.div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-[36px] font-black tracking-tight leading-tight">
                                        {algo.name}
                                    </h1>
                                    {algo.user?.isVerified && (
                                        <SealCheck size={28} weight="fill" className="text-[var(--text-primary)]" />
                                    )}
                                    <span className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-zinc-500 text-[12px] px-3 py-1 rounded-[8px] font-bold">
                                        v{algo.version || '1.0.0'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 text-zinc-500 font-bold text-[14px]">
                                    <div className="flex items-center gap-2">
                                        <UserCircle size={20} weight="light" />
                                        <span>By {algo.user?.username || 'Arteo'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={20} weight="light" />
                                        <span>Updated {new Date(algo.updatedAt).toLocaleDateString('en-US')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleInstall}
                                    disabled={isInstalling || isActive}
                                    className={`h-14 px-10 rounded-[8px] font-black text-[16px] shadow-none shadow-black/10 flex items-center gap-3 transition-all active:scale-95 ${
                                        isActive 
                                        ? 'bg-[var(--bg-secondary)] text-green-500 border border-green-500/20' 
                                        : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'
                                    }`}
                                >
                                    {isInstalling ? (
                                        <LoadingSpinner size="sm" />
                                    ) : isActive ? (
                                        <CheckCircle size={22} weight="fill" />
                                    ) : (
                                        <CloudArrowDown size={22} weight="bold" />
                                    )}
                                    {isInstalling ? 'Activating...' : isActive ? 'Activated' : 'Activate Algorithm'}
                                </Button>

                                {isInstalled && !isOwner && (
                                    <Button
                                        onClick={async () => {
                                            if (!personalRecord) return;
                                            const confirm = window.confirm('Are you sure you want to uninstall this algorithm?');
                                            if (!confirm) return;
                                            
                                            try {
                                                await algorithmApi.deleteAlgorithm(personalRecord.uuid);
                                                toast.success('Algorithm uninstalled');
                                                await refreshAlgorithms();
                                                await queryClient.invalidateQueries({ queryKey: queryKeys.algorithms });
                                            } catch (err) {
                                                toast.error('Unable to uninstall algorithm');
                                            }
                                        }}
                                        className="h-14 px-8 rounded-[8px] bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold text-[14px] transition-all"
                                    >
                                        Uninstall
                                    </Button>
                                )}

                                {isOwner && (
                                    <Button
                                        onClick={() => navigate(`/algorithms/studio/${id}`)}
                                        className="h-14 w-14 rounded-[8px] bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--text-primary)]/30 flex items-center justify-center transition-all"
                                    >
                                        <Gear size={24} weight="light" />
                                    </Button>
                                )}

                                <Button
                                    className="h-14 w-14 rounded-[8px] bg-[var(--bg-secondary)] text-zinc-500 border border-[var(--border-primary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all"
                                >
                                    <ShareNetwork size={24} weight="light" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-[var(--border-primary)]">
                        <div className="md:col-span-2 space-y-10">
                            <section className="space-y-4">
                                <h3 className="text-[18px] font-bold tracking-tight">About this algorithm</h3>
                                <p className="text-zinc-500 text-[16px] leading-relaxed font-medium">
                                    {algo.description || 'An algorithm configuration that powers a personalized Arteo feed experience.'}
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[18px] font-bold tracking-tight">Key features</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        'Personal feed optimization',
                                        'Smart content filtering',
                                        'High-quality content priority',
                                        'Real-time updates'
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)]">
                                            <CheckCircle size={20} weight="fill" className="text-[var(--text-primary)]" />
                                            <span className="text-[14px] font-bold">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-6 space-y-6">
                                <h3 className="text-[16px] font-bold flex items-center gap-2">
                                    <Tag size={18} weight="bold" />
                                    Additional information
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 text-[13px] font-bold">Category</span>
                                        <span className="text-[13px] font-black text-[var(--text-primary)]">{algo.category || 'General'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 text-[13px] font-bold">Trust</span>
                                        <span className="text-[13px] font-black text-green-500">Verified</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500 text-[13px] font-bold">License</span>
                                        <span className="text-[13px] font-black text-[var(--text-primary)]">Arteo Standard</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--border-primary)] space-y-4">
                                    <span className="text-zinc-500 text-[11px] font-bold">Tags</span>
                                    <div className="flex flex-wrap gap-2">
                                        {(algo.tags || ['discovery', 'curation', 'intelligence']).map((tag: string) => (
                                            <span key={tag} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] text-zinc-500 text-[11px] px-3 py-1 rounded-[8px] font-bold hover:border-[var(--text-primary)]/20 transition-colors cursor-default">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AlgorithmDetail;
