import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '@shared/ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import { cn } from '@shared/lib';
import { Button } from '@shared/ui';

interface FeedHeaderProps {
    onAlgoChange?: (algoUuid?: string) => void;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ onAlgoChange }) => {
    const { t } = useTranslation();
    const { 
        algorithms, 
        activeAlgoUuid, 
        setActiveAlgoUuid,
        refreshAlgorithms 
    } = useAlgorithms();
    
    const activeAlgo = algorithms.find(a => a.uuid === activeAlgoUuid);
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Icon logic consistent with AlgorithmsList
    const getAlgoIcon = (algo: any, size = 20, isActive = false) => {
        if (!algo) return <Icons.Sparkles size={size} className="text-zinc-500" />;
        const name = algo.name.toLowerCase();
        const color = isActive ? "text-[var(--bg-primary)]" : "text-zinc-500";
        
        if (name.includes('brain') || name.includes('ai') || name.includes('standard')) 
            return <Icons.Butterfly size={size} className={isActive ? color : "text-[var(--text-primary)]"} weight="thin" />;
        if (name.includes('speed')) 
            return <Icons.Lightning size={size} className={isActive ? color : "text-amber-500"} weight={isActive ? "fill" : "thin"} />;
        if (name.includes('pulse') || name.includes('trend')) 
            return <Icons.Selection size={size} className={isActive ? color : "text-[var(--text-primary)]"} weight="thin" />;
        
        return <Icons.Butterfly size={size} className={color} weight="thin" />;
    };

    const toggleDropdown = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        // Force a fresh fetch when opening to ensure real-time consistency
        if (nextState) {
            refreshAlgorithms();
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = async (algo: any) => {
        if (isSwitching || algo.uuid === activeAlgoUuid) {
            setIsOpen(false);
            return;
        }
        setIsSwitching(true);
        setIsOpen(false);
        
        try {
            await setActiveAlgoUuid(algo.uuid);
            if (onAlgoChange) onAlgoChange(algo.uuid);
        } catch (err) {
            console.error('[FeedHeader] Failed to switch algo:', err);
            refreshAlgorithms();
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <div className="sticky top-0 z-[100] w-full bg-[var(--bg-primary)] border-b border-black">
            <div className="relative flex h-[60px] w-full items-center justify-center gap-6 px-5">
                <div className="relative" ref={dropdownRef}>
                    <Button
                        variant="ghost"
                        onClick={toggleDropdown}
                        className="flex h-10 items-center gap-3 border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 transition-all active:scale-95 group hover:border-black"
                    >
                        <span className="text-[15px] font-bold text-[var(--text-primary)] leading-none tracking-tight">
                            {activeAlgo?.name || 'Feed'}
                        </span>
                        <div className="w-7 h-7 bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center transition-colors group-hover:border-black">
                            <Icons.CaretDown 
                                size={12} 
                                weight="bold" 
                                className={cn("text-[var(--text-muted)] transition-transform duration-500", isOpen ? "rotate-180 text-[var(--text-primary)]" : "rotate-0")} 
                            />
                        </div>
                    </Button>

                    {isOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[260px] bg-[var(--bg-primary)] border border-black z-[200] p-2 overflow-hidden">
                            <div className="px-3 py-2 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                                    {t('feed.personal_algorithms')}
                                </span>
                            </div>

                            <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                                {(() => {
                                    const displayAlgos = algorithms.length > 0
                                        ? algorithms
                                        : (activeAlgo ? [activeAlgo] : []);

                                    return displayAlgos
                                        .sort((a: any, b: any) => {
                                            const pinA = a.isPinned ? 0 : 1;
                                            const pinB = b.isPinned ? 0 : 1;
                                            if (pinA !== pinB) return pinA - pinB;
                                            return (a.pinOrder || 999) - (b.pinOrder || 999);
                                        })
                                        .map((algo: any) => {
                                            const isActive = algo.uuid === activeAlgo?.uuid;
                                            return (
                                                <button
                                                    key={algo.uuid}
                                                    onClick={() => handleSwitch(algo)}
                                                    className={cn(
                                                        "w-full flex items-center p-2.5 rounded-[8px] transition-all active:scale-[0.97]",
                                                        isActive ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'hover:bg-[var(--text-primary)]/5 text-[var(--text-primary)]'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mr-3",
                                                        isActive ? 'bg-[var(--bg-primary)]/20' : 'bg-[var(--text-primary)]/10'
                                                    )}>
                                                        {getAlgoIcon(algo, 16, isActive)}
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className={cn("text-[14px] font-bold leading-tight truncate", isActive ? 'text-[var(--bg-primary)]' : 'text-[var(--text-primary)]')}>
                                                            {algo.name}
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <Icons.Check size={14} weight="bold" className="text-[var(--bg-primary)] ml-2" />
                                                    )}
                                                </button>
                                            );
                                        });
                                })()}
                            </div>

                            <div className="mt-2 pt-2 border-t border-[var(--border-primary)] space-y-1">
                                <button
                                    disabled
                                    className="w-full flex items-center p-2.5 rounded-[8px] opacity-50 cursor-not-allowed"
                                >
                                    <div className="w-8 h-8 rounded-[8px] bg-[var(--text-primary)]/10 flex items-center justify-center shrink-0 mr-3 text-[var(--text-muted)]">
                                        <Icons.Plus size={16} weight="bold" />
                                    </div>
                                    <span className="text-[13px] font-bold text-[var(--text-muted)]">
                                        {t('feed.create_new')} · Soon
                                    </span>
                                </button>

                                <button
                                    onClick={() => { setIsOpen(false); navigate('/algorithms'); }}
                                    className="w-full flex items-center p-2.5 rounded-[8px] hover:bg-[var(--text-primary)]/5 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-[8px] bg-[var(--text-primary)]/10 flex items-center justify-center shrink-0 mr-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                                        <Icons.Books size={16} weight="bold" />
                                    </div>
                                    <span className="text-[13px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                                        Algorithm list
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedHeader;
