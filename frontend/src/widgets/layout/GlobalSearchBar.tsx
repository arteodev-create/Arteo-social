import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User as UserIcon, Settings, Hash, FileText, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@shared/ui';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '@features/search/api';
import { Avatar } from '@shared/ui';

import { useTranslation } from 'react-i18next';

interface GlobalSearchBarProps {
    className?: string;
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ className }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        users: any[],
        posts: any[],
        communities?: any[],
        algorithms?: any[]
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const trimmedQuery = query.trim();
            if (trimmedQuery.length >= 2) {
                setLoading(true);
                try {


                    const { success, data } = await searchApi.searchAll(trimmedQuery);
                    if (success && data) {
                        setResults(data);
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (path: string) => {
        setIsOpen(false);
        navigate(path);
        setQuery('');
    };

    return (
        <div ref={searchRef} className={`relative max-w-[600px] w-full mx-auto ${className}`}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400 transition-colors" strokeWidth={1.2} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setIsOpen(true); }}
                    placeholder={t('search.placeholder')}
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-[0px] py-2.5 pl-12 pr-12 focus:outline-none focus:border-zinc-300 transition-all placeholder:text-zinc-400 text-[14px] font-medium"
                />
                <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                    {query && (
                        <button
                            onClick={() => { setQuery(''); setResults(null); setIsOpen(false); }}
                            className="text-zinc-400 hover:text-black transition-colors"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <X className="h-4 w-4" />}
                        </button>
                    )}
                    <button type="button" className="text-zinc-300">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                        </svg>
                    </button>
                </div>
            </div>

            {isOpen && results && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-zinc-100 rounded-[8px] shadow-none overflow-hidden z-[100] max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {/* Users */}
                    {results.users.length > 0 && (
                        <div className="border-b border-zinc-50">
                            <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-500 bg-zinc-50/50">{t('search.people')}</div>
                            {results.users.map(user => (
                                <div
                                    key={user.uuid || user.id}
                                    onClick={() => handleSelect(`/${user.username}`)}
                                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 cursor-pointer transition-colors"
                                >
                                    <Avatar 
                                        src={user.avatar} 
                                        username={user.username} 
                                        seed={user.uuid || user.id}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-[15px] text-black truncate">{user.username}</div>
                                        <div className="text-[13px] text-zinc-500 font-medium truncate">{user.full_name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Algorithms */}
                    {results.algorithms && results.algorithms.length > 0 && (
                        <div className="border-b border-zinc-50">
                            <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-500 bg-zinc-50/50">{t('search.algorithms')}</div>
                            {results.algorithms?.map(algo => (
                                <div
                                    key={algo.uuid || algo.id}
                                    onClick={() => handleSelect(`/marketplace/algorithm/${algo.short_id || algo.uuid}`)}
                                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 cursor-pointer transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-[8px] bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                        <Settings className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-[15px] text-black truncate">{algo.name}</div>
                                        <div className="text-[13px] text-zinc-500 font-medium flex items-center gap-2">
                                            {algo.topic && <span className="bg-zinc-100 text-black px-2 py-0.5 rounded text-[10px] font-bold">#{algo.topic}</span>}
                                            <span className="flex items-center gap-0.5">by @{algo.user?.username}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Posts */}
                    {results.posts.length > 0 && (
                        <div>
                            <div className="px-4 py-2.5 text-[11px] font-bold text-zinc-500 bg-zinc-50/50">{t('search.posts')}</div>
                            {results.posts.map(post => (
                                <div
                                    key={post.uuid || post.id}
                                    onClick={() => {
                                        handleSelect(`/p/${post.short_id || post.uuid}`);
                                    }}
                                    className="flex gap-3 px-4 py-4 hover:bg-zinc-50 cursor-pointer transition-colors group border-b border-zinc-50 last:border-none"
                                >
                                    <div className="mt-1">
                                        <Hash className="w-4 h-4 text-zinc-300 group-hover:text-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[14px] text-zinc-600 font-medium line-clamp-2 leading-relaxed">{post.content}</div>
                                        <div className="text-[12px] text-zinc-400 mt-1.5 font-bold">@{post.author?.username}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.users.length === 0 && (!results.algorithms || results.algorithms.length === 0) && results.posts.length === 0 && (
                        <div className="px-4 py-12 text-center text-zinc-400 font-medium text-[14px]">
                            {t('search.no_results', { query })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearchBar;
