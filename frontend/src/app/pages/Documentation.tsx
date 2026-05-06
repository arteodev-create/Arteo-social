import React, { useState } from 'react';
import MainLayout from '@widgets/layout/MainLayout';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
    Book, Code, Cpu, Code2, Zap, Box, Info, Hash, Layers
} from 'lucide-react';
import { Button } from '@shared/ui';
import { cn } from '@shared/lib';

const Documentation = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: t('documentation.sidebar.overview'), icon: <Info size={14} /> },
        { id: 'architecture', title: t('documentation.sidebar.architecture'), icon: <Layers size={14} /> },
        { id: 'recode-dsl', title: t('documentation.sidebar.recode_dsl'), icon: <Code size={14} /> },
        { id: 'properties', title: t('documentation.sidebar.properties'), icon: <Hash size={14} /> },
        { id: 'best-practices', title: t('documentation.sidebar.best_practices'), icon: <Zap size={14} /> },
    ];

    return (
        <MainLayout layoutMode="full">
            <Helmet>
                <title>{t('titles.documentation')} | Arteo SDK</title>
            </Helmet>
            <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg-primary)]">
                {/* Side Navigation */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-primary)] p-6 flex flex-col gap-1">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <Book className="text-[var(--text-primary)]" size={18} />
                        <h2 className="text-[15px] font-bold tracking-tight text-display text-[var(--text-primary)]">{t('documentation.title')}</h2>
                    </div>

                    {sections.map(section => (
                        <Button
                            key={section.id}
                            variant={activeSection === section.id ? 'primary' : 'ghost'}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "justify-start gap-4 px-4 py-6 rounded-[8px] text-[12.5px] font-bold tracking-tight transition-all",
                                activeSection === section.id 
                                    ? "shadow-none scale-[1.02]" 
                                    : "text-zinc-500 hover:text-[var(--text-primary)]"
                            )}
                        >
                            {section.icon}
                            {section.title}
                        </Button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-16">

                        {activeSection === 'overview' && (
                            <section className="space-y-8 animate-in fade-in duration-500">
                                <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tighter leading-none text-display">{t('documentation.overview.title')}</h1>
                                <p className="text-[15px] text-zinc-500 font-medium leading-relaxed tracking-tight text-readable">
                                    {t('documentation.overview.desc')}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                    <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-primary)] transition-all hover:border-[var(--text-primary)]/10 group rounded-[8px]">
                                        <Layers className="text-[var(--text-primary)] mb-4" size={24} />
                                        <h3 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-2 text-display">{t('documentation.overview.sequential.title')}</h3>
                                        <p className="text-[13px] text-zinc-500 font-medium tracking-tight leading-normal text-readable">{t('documentation.overview.sequential.desc')}</p>
                                    </div>
                                    <div className="p-6 bg-[var(--bg-primary)] border border-[var(--border-primary)] transition-all hover:border-[var(--text-primary)]/10 group rounded-[8px]">
                                        <Box className="text-[var(--text-primary)] mb-4" size={24} />
                                        <h3 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-2 text-display">{t('documentation.overview.microblocks.title')}</h3>
                                        <p className="text-[13px] text-zinc-500 font-medium tracking-tight leading-normal text-readable">{t('documentation.overview.microblocks.desc')}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeSection === 'architecture' && (
                             <section className="space-y-10 animate-in fade-in duration-500">
                                <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tighter leading-none text-display">{t('documentation.architecture.title')}</h1>
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-8 rounded-[8px]">
                                    <h3 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-3 flex items-center gap-2 text-display">
                                        <Zap size={16} /> {t('documentation.architecture.philosophy')}
                                    </h3>
                                    <p className="text-[14px] text-zinc-500 font-medium tracking-tight leading-relaxed text-readable">
                                        {t('documentation.architecture.philosophy_desc')}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="w-9 h-9 bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center text-[13px] font-bold shrink-0 rounded-[8px]">1</div>
                                        <div>
                                            <h4 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-1.5 text-display">{t('documentation.architecture.steps.exit.title')}</h4>
                                            <p className="text-[13px] text-zinc-500 font-medium leading-normal text-readable">{t('documentation.architecture.steps.exit.desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-9 h-9 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[13px] font-bold shrink-0 rounded-[8px]">2</div>
                                        <div>
                                            <h4 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-1.5 text-display">{t('documentation.architecture.steps.scoring.title')}</h4>
                                            <p className="text-[13px] text-zinc-500 font-medium leading-normal text-readable">{t('documentation.architecture.steps.scoring.desc')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-9 h-9 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] flex items-center justify-center text-[13px] font-bold shrink-0 rounded-[8px]">3</div>
                                        <div>
                                            <h4 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-1.5 text-display">{t('documentation.architecture.steps.polish.title')}</h4>
                                            <p className="text-[13px] text-zinc-500 font-medium leading-normal text-readable">{t('documentation.architecture.steps.polish.desc')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeSection === 'recode-dsl' && (
                            <section className="space-y-12 animate-in fade-in duration-500">
                                <div>
                                    <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tighter leading-none text-display mb-6">{t('documentation.recode_dsl.title')}</h1>
                                    <p className="text-[15px] text-zinc-500 font-medium tracking-tight mb-8">{t('documentation.recode_dsl.desc')}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-6 rounded-[8px]">
                                        <h3 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-4 flex items-center gap-2 text-display">
                                            <Code2 size={16} /> {t('documentation.recode_dsl.block_structure')}
                                        </h3>
                                        <pre className="text-[12px] font-medium text-zinc-500 bg-[var(--bg-secondary)] p-5 rounded-[8px] border border-[var(--border-primary)] overflow-x-auto font-mono">
                                            {`block "SafetyFilter" {
    if post.stats.like_count < 10 {
        filter_out
    }
    penalty 20
}`}
                                        </pre>
                                    </div>
                                    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-6 rounded-[8px]">
                                        <h3 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-4 flex items-center gap-2 text-display">
                                            <Cpu size={16} /> {t('documentation.recode_dsl.pipeline_structure')}
                                        </h3>
                                        <pre className="text-[12px] font-medium text-zinc-500 bg-[var(--bg-secondary)] p-5 rounded-[8px] border border-[var(--border-primary)] overflow-x-auto font-mono">
                                            {`use SafetyFilter();
use Personalization();
 
boost 50;
log "Pipeline executed";`}
                                        </pre>
                                    </div>
                                </div>
                                <div className="border border-[var(--border-primary)] overflow-hidden rounded-[8px]">
                                    <table className="w-full text-left text-[13px] font-medium tracking-tight">
                                        <thead className="bg-[var(--bg-secondary)] text-zinc-500 border-b border-[var(--border-primary)]">
                                            <tr>
                                                <th className="px-6 py-5 font-bold">{t('documentation.recode_dsl.table.command')}</th>
                                                <th className="px-6 py-5 font-bold">{t('documentation.recode_dsl.table.meaning')}</th>
                                                <th className="px-6 py-5 font-bold">{t('documentation.recode_dsl.table.example')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-primary)]">
                                            {[
                                                { cmd: 'use', desc: t('documentation.recode_dsl.table.use'), ex: 'use FilterBlock();' },
                                                { cmd: 'filter_out', desc: t('documentation.recode_dsl.table.filter_out'), ex: 'filter_out;' },
                                                { cmd: 'boost [N]', desc: t('documentation.recode_dsl.table.boost'), ex: 'boost 100;' },
                                                { cmd: 'penalty [N]', desc: t('documentation.recode_dsl.table.penalty'), ex: 'penalty 50;' }
                                            ].map((item, i) => (
                                                <tr key={i} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                    <td className="px-6 py-5 font-bold text-[var(--text-primary)] font-mono">{item.cmd}</td>
                                                    <td className="px-6 py-5 text-zinc-500">{item.desc}</td>
                                                    <td className="px-6 py-5 text-zinc-500 font-mono text-[12px] opacity-70">{item.ex}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeSection === 'properties' && (
                            <section className="space-y-10 animate-in fade-in duration-500">
                                <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tighter leading-none text-display mb-6">{t('documentation.properties.title')}</h1>
                                <p className="text-[15px] text-zinc-500 font-medium tracking-tight mb-8">{t('documentation.properties.desc')}</p>
                                <div className="border border-[var(--border-primary)] overflow-hidden rounded-[8px]">
                                    <table className="w-full text-left text-[13px] font-medium tracking-tight text-readable">
                                        <thead className="bg-[var(--bg-secondary)] text-zinc-500 border-b border-[var(--border-primary)]">
                                            <tr>
                                                <th className="px-6 py-5 font-bold">{t('documentation.properties.property')}</th>
                                                <th className="px-6 py-5 font-bold">{t('documentation.properties.type')}</th>
                                                <th className="px-6 py-5 font-bold">{t('documentation.properties.description')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-primary)] text-readable">
                                            {[
                                                { k: 'post.stats.like_count', t: t('documentation.properties.types.number'), d: t('documentation.properties.list.like_count') },
                                                { k: 'post.author.is_verified', t: t('documentation.properties.types.logic'), d: t('documentation.properties.list.is_verified') },
                                                { k: 'post.is_promoted', t: t('documentation.properties.types.logic'), d: t('documentation.properties.list.is_promoted') },
                                                { k: 'post.hours_since_created', t: t('documentation.properties.types.number'), d: t('documentation.properties.list.hours_since_created') }
                                            ].map(item => (
                                                <tr key={item.k} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                                    <td className="px-6 py-5 text-[var(--text-primary)] font-mono font-bold">{item.k}</td>
                                                    <td className="px-6 py-5 text-zinc-500">{item.t}</td>
                                                    <td className="px-6 py-5 text-zinc-500">{item.d}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeSection === 'best-practices' && (
                            <section className="space-y-10 animate-in fade-in duration-500">
                                <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tighter leading-none text-display mb-6">{t('documentation.best_practices.title')}</h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] group hover:bg-[var(--bg-primary)] hover:border-[var(--text-primary)]/10 transition-all">
                                        <h4 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-4 flex items-center gap-2 text-display">
                                            <Zap size={16} /> {t('documentation.best_practices.performance.title')}
                                        </h4>
                                        <p className="text-[13px] text-zinc-500 font-medium tracking-tight leading-relaxed text-readable">
                                            {t('documentation.best_practices.performance.desc')}
                                        </p>
                                    </div>
                                    <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] group hover:bg-[var(--bg-primary)] hover:border-[var(--text-primary)]/10 transition-all">
                                        <h4 className="text-[var(--text-primary)] text-[15px] font-bold tracking-tight mb-4 flex items-center gap-2 text-display">
                                            <Cpu size={16} /> {t('documentation.best_practices.diversity.title')}
                                        </h4>
                                        <p className="text-[13px] text-zinc-500 font-medium tracking-tight leading-relaxed text-readable">
                                            {t('documentation.best_practices.diversity.desc')}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Documentation;

