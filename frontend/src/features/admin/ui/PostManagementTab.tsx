import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, ArrowClockwise, Trash } from '@phosphor-icons/react';
import { Button } from '@shared/ui';

interface PostManagementTabProps {
    posts: any[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    fetchPosts: () => void;
    handleDeletePost: (uuid: string) => void;
    isLoading: boolean;
}

export const PostManagementTab: React.FC<PostManagementTabProps> = ({
    posts,
    searchQuery,
    setSearchQuery,
    fetchPosts,
    handleDeletePost,
    isLoading
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-black animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-12 shrink-0">
                <div>
                    <h1 className="text-[28px] font-bold text-white mb-1">{t('admin_ui.content_moderation')}</h1>
                    <p className="text-[14px] text-zinc-500 font-bold">{t('admin_ui.content_moderation_desc')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                        <input
                            type="text"
                            placeholder={t('admin_ui.search_content_or_author')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                            className="bg-zinc-900/50 border border-white/10 h-11 rounded-[8px] pl-12 pr-6 text-[14px] text-white font-bold outline-none focus:border-white/20 w-[300px] transition-all"
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchPosts} className={`h-11 w-11 text-zinc-500 ${isLoading ? 'animate-spin text-white' : ''}`}>
                        <ArrowClockwise size={18} weight="bold" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-black border-b border-white/10">
                        <tr>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500">{t('admin_ui.post_content')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-center">{t('admin_ui.author')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-center">{t('admin_ui.engagement')}</th>
                            <th className="px-6 py-5 text-[12px] font-bold text-zinc-500 text-right">{t('admin_ui.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {posts.map((p) => (
                            <tr key={p.uuid} className="group transition-colors hover:bg-white/[0.02]">
                                <td className="px-6 py-6 max-w-md">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[14px] font-bold text-white leading-relaxed line-clamp-2">{p.content}</p>
                                        <span className="text-[11px] text-zinc-600 font-bold">{t('admin_ui.identifier')}: {p.uuid}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-zinc-900 border border-white/5">
                                            {p.user?.avatar ? <img src={p.user.avatar} alt={p.user?.username || ''} className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <span className="text-[12px] font-bold text-zinc-400">@{p.user?.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center justify-center gap-6 text-zinc-500">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[14px] font-bold text-white">{p.stats?.likesCount || 0}</span>
                                            <span className="text-[10px] font-bold text-zinc-600">{t('common.likes')}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[14px] font-bold text-white">{p.stats?.commentsCount || 0}</span>
                                            <span className="text-[10px] font-bold text-zinc-600">{t('admin_ui.comments')}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <button
                                        className="h-9 px-6 bg-zinc-900 border border-white/10 rounded-[8px] text-white font-bold text-[11px] active:scale-95 transition-all flex items-center gap-2 ml-auto hover:bg-white hover:text-black hover:border-white"
                                        onClick={() => handleDeletePost(p.uuid)}
                                    >
                                        <Trash size={16} weight="bold" />
                                        {t('admin_ui.remove_content')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && !isLoading && (
                    <div className="py-24 text-center">
                        <p className="text-[14px] text-zinc-600 font-bold">{t('admin_ui.no_violating_content')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
