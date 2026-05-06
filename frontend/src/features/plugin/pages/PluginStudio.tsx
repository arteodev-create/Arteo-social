import React, { memo, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { pluginApi } from '@features/plugin/api';
import { Icons } from '@shared/ui';
import { cn } from '@shared/lib';
import { Button } from '@shared/ui';
import { useModal } from '../../../contexts/ModalContext';
import { MODAL_IDS } from '@constants/modalIds';
import { LoadingSpinner } from '@shared/ui';
import type { Plugin, PluginPayload } from '@features/plugin/model';

const DEFAULT_CODE = `plugin "Untitled Plugin" {
    category "General"
    description "Describe what this plugin does"
    version "1.0.0"
    tags ["core"]

    block "Main" {
        // Write processing logic here
    }
}`;

interface PluginStudioMetadata extends PluginPayload {
    name: string;
    category: string;
    version: string;
    tags: string[];
}

interface StudioHeaderProps {
    metadata: PluginStudioMetadata;
    id?: string;
    onSave: () => void;
    onDelete: () => void;
    onToggleSidebar: () => void;
    showSidebar: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const isPlugin = (value: unknown): value is Plugin => Boolean(value && typeof value === 'object' && 'uuid' in value);

const unwrapPlugin = (response: unknown): Plugin | null => {
    const payload = response as { data?: unknown } | undefined;
    const responseData = payload?.data;
    const data = responseData && typeof responseData === 'object' && 'plugin' in responseData
        ? (responseData as { plugin?: unknown }).plugin
        : responseData;
    return isPlugin(data) ? data : null;
};

const StudioHeader = memo(({ metadata, id, onSave, onDelete, onToggleSidebar, showSidebar, saveStatus }: StudioHeaderProps) => {
    const navigate = useNavigate();
    return (
        <header className="h-[72px] shrink-0 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-center justify-between px-8 z-[100] transition-none">
            <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/plugins')} className="w-10 h-10 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]/80">
                    <Icons.Arrow size={16} weight="bold" className="text-[var(--text-primary)]" />
                </Button>
                <div className="flex items-center gap-4 bg-[var(--bg-secondary)]/80 border border-[var(--border-primary)] px-5 py-2.5 rounded-[8px] shadow-sm">
                    <div className="w-8 h-8 rounded-[8px] bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-primary)] shadow-md"><Icons.Books size={18} weight="light" /></div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[15px] font-black tracking-tight text-[var(--text-primary)] leading-none">Library Settings</h1>
                            <span className="bg-[var(--bg-primary)] text-[var(--text-primary)] px-2 py-0.5 rounded-[8px] text-[9px] font-bold border border-[var(--border-primary)]">v{metadata.version}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 mt-0.5 max-w-[200px] truncate leading-none">{metadata.name}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {id && <Button variant="ghost" onClick={onDelete} className="px-5 h-10 rounded-[8px] text-zinc-500 hover:text-rose-600 hover:bg-rose-50/10 font-bold text-[12px]"><Icons.Trash size={16} weight="bold" /><span>Delete</span></Button>}
                <Button onClick={onSave} disabled={saveStatus === 'saving'} className="px-6 h-10 rounded-[8px] flex items-center gap-2 font-bold text-[13px] bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-none shadow-black/5">
                    {saveStatus === 'saved' ? <Icons.Check size={18} weight="bold" /> : <Icons.Share size={18} weight="bold" />}
                    <span>{saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className={cn('w-10 h-10 rounded-[8px] border transition-none', showSidebar ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--text-primary)]/20' : 'bg-[var(--bg-primary)] text-zinc-500 border-[var(--border-primary)]')}><Icons.Sidebar size={22} weight="bold" /></Button>
            </div>
        </header>
    );
});

const StudioStatusBar = memo(({ cursor, t }: { cursor: { ln: number; col: number }; t: (key: string, fallback?: string) => string }) => (
    <div className="h-10 flex items-center justify-between px-4 bg-[var(--bg-primary)] text-[10px] font-bold text-zinc-500 shrink-0 mt-1 select-none">
        <div className="flex items-center gap-4"><div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-[8px]" /><span>{t('marketplace.sidebar.connected_status', 'Connected')}</span></div><span>V4.10.1</span></div>
        <div className="flex items-center gap-6"><span className="font-mono w-24 text-right">Ln {cursor.ln}, Col {cursor.col}</span><div className="flex items-center gap-2 text-[var(--text-primary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-[8px] border border-[var(--border-primary)]"><Icons.Link size={10} className="text-zinc-500" /><span className="text-[9px]">Re-Code Protocol</span></div></div>
    </div>
));

const PluginStudio = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { openModal } = useModal();
    const [code, setCode] = useState<string>(DEFAULT_CODE);
    const [metadata, setMetadata] = useState<PluginStudioMetadata>({ name: 'Untitled Plugin', description: '', category: 'General', is_public: false, version: '1.0.0', tags: [] });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isLoading, setIsLoading] = useState(Boolean(id && id !== 'new'));
    const [showSidebar, setShowSidebar] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'config' | 'blocks' | 'syntax'>('config');
    const [cursor, setCursor] = useState({ ln: 1, col: 1 });
    const [parsedBlocks, setParsedBlocks] = useState<string[]>([]);

    useEffect(() => {
        if (!code) return;
        const pluginMatch = code.match(/plugin\s+"([^"]+)"/);
        const versionMatch = code.match(/version\s+"([^"]+)"/);
        const extractedName = pluginMatch ? pluginMatch[1] : metadata.name;
        const extractedVersion = versionMatch ? versionMatch[1] : metadata.version;
        if (extractedName !== metadata.name || extractedVersion !== metadata.version) setMetadata((prev) => ({ ...prev, name: extractedName, version: extractedVersion }));
        const blocks: string[] = [];
        code.split('\n').forEach(line => {
            const match = line.match(/^\s*block\s+"([^"]+)"\s*\{/);
            if (match) blocks.push(match[1]);
        });
        setParsedBlocks(blocks);
    }, [code, metadata.name, metadata.version]);

    const updateMetadata = (updates: Partial<PluginStudioMetadata>) => {
        const newMetadata = { ...metadata, ...updates };
        setMetadata(newMetadata);
        const lines = code.split('\n');
        if (updates.name !== undefined) {
            const index = lines.findIndex(line => line.trim().startsWith('plugin "'));
            if (index !== -1) lines[index] = lines[index].replace(/"[^"]+"/, `"${updates.name}"`);
        }
        if (updates.version !== undefined) {
            const index = lines.findIndex(line => line.trim().startsWith('version "'));
            if (index !== -1) lines[index] = lines[index].replace(/"[^"]+"/, `"${updates.version}"`);
        }
        const nextCode = lines.join('\n');
        if (nextCode !== code) setCode(nextCode);
    };

    useEffect(() => {
        if (id && id !== 'new') {
            setIsLoading(true);
            pluginApi.getPluginById(id).then(res => {
                if (res.success && res.data) {
                    const plugin = unwrapPlugin(res);
                    if (!plugin) {
                        toast.error('Unable to load plugin. Please try again.');
                        navigate('/plugins', { replace: true });
                        return;
                    }
                    setCode(plugin.code || DEFAULT_CODE);
                    setMetadata({ name: plugin.name || 'Untitled Plugin', description: plugin.description || '', category: plugin.category || 'General', is_public: !!plugin.is_public, version: plugin.version || '1.0.0', tags: plugin.tags || [] });
                } else {
                    toast.error('Unable to load plugin. Please try again.');
                    navigate('/plugins', { replace: true });
                }
                setIsLoading(false);
            }).catch(() => { toast.error('Unable to load plugin. Please try again.'); setIsLoading(false); });
        } else {
            setCode(DEFAULT_CODE);
            setMetadata({ name: 'Untitled Plugin', description: '', category: 'General', is_public: false, version: '1.0.0', tags: [] });
            setIsLoading(false);
        }
    }, [id, navigate]);

    const handleSave = async () => {
        if (saveStatus === 'saving') return;
        setSaveStatus('saving');
        try {
            const isNew = !id || id === 'new';
            const res = isNew ? await pluginApi.createPlugin({ ...metadata, code }) : await pluginApi.updatePlugin(id, { ...metadata, code });
            if (res.success) {
                setSaveStatus('saved');
                toast.success(isNew ? 'Plugin created successfully' : 'Plugin saved successfully');
                const newPlugin = unwrapPlugin(res);
                const newUuid = newPlugin?.uuid;
                if (isNew && newUuid) navigate(`/plugins/studio/${newUuid}`, { replace: true });
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
                toast.error('Unable to save plugin');
            }
        } catch {
            setSaveStatus('error');
            toast.error('Connection error while saving plugin');
        }
    };

    const handleDelete = () => {
        openModal(MODAL_IDS.CONFIRM, { title: 'Delete plugin?', onConfirm: async () => { const res = await pluginApi.deletePlugin(id!); if (res.success) navigate('/plugins'); } });
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        monaco.editor.setTheme(document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs');
        editor.onDidChangeCursorPosition((event: any) => setCursor({ ln: event.position.lineNumber, col: event.position.column }));
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]"><LoadingSpinner size="lg" label="Preparing Arteo Studio..." /></div>;

    return (
        <>
            <Helmet><title>{metadata?.name ? `${metadata.name} | Arteo Studio` : 'Arteo Studio'}</title></Helmet>
            <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden outline-none">
                <style>{`* { outline: none !important; transition: none !important; backface-visibility: hidden; } .monaco-editor, .monaco-editor .overflow-guard { border-radius: 20px !important; } .no-jitter { transform: translateZ(0); will-change: transform; }`}</style>
                <StudioHeader metadata={metadata} id={id} onSave={handleSave} onDelete={handleDelete} onToggleSidebar={() => setShowSidebar(!showSidebar)} showSidebar={showSidebar} saveStatus={saveStatus} />
                <div className="flex-1 flex overflow-hidden w-full relative bg-[var(--bg-secondary)]/50 no-jitter">
                    <main className="flex-1 flex flex-col p-6 overflow-hidden items-center justify-center">
                        <div className="w-full max-w-[1200px] h-full flex flex-col bg-[var(--bg-primary)] rounded-[8px] border border-[var(--border-primary)] shadow-sm overflow-hidden relative p-3 no-jitter">
                            <div className="flex-1 w-full relative overflow-hidden rounded-[8px] border border-[var(--border-primary)]">
                                <Editor height="100%" language="recode" value={code} onChange={(value) => value !== undefined && setCode(value)} onMount={handleEditorDidMount} options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false }, padding: { top: 24, bottom: 8 }, automaticLayout: true, scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, useShadows: false, vertical: 'visible', horizontal: 'auto' }, lineNumbersMinChars: 3 }} />
                            </div>
                            <StudioStatusBar cursor={cursor} t={t} />
                        </div>
                    </main>
                    <AnimatePresence>
                        {showSidebar && (
                            <motion.aside initial={{ width: 0 }} animate={{ width: 380 }} exit={{ width: 0 }} className="border-l border-[var(--border-primary)] bg-[var(--bg-primary)] flex flex-col shrink-0 relative z-[50] overflow-hidden no-jitter">
                                <div className="px-5 pt-5 pb-2 shrink-0">
                                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[8px] p-1.5 flex items-center">
                                        {['config', 'blocks', 'syntax'].map((tab) => <button key={tab} onClick={() => setSidebarTab(tab as any)} className={cn('flex-1 flex items-center justify-center py-2 rounded-[8px] text-[12px] font-bold', sidebarTab === tab ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-md border border-[var(--border-primary)]/50' : 'text-zinc-500')}>{tab === 'config' ? 'Config' : tab === 'blocks' ? 'Blocks' : 'Syntax'}</button>)}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">
                                    {sidebarTab === 'config' && <div className="space-y-4"><label className="text-[11px] font-bold text-zinc-500 ml-1">Plugin name</label><input type="text" value={metadata.name} onChange={event => updateMetadata({ name: event.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] h-11 px-4 text-[14px] font-bold text-[var(--text-primary)]" /><label className="text-[11px] font-bold text-zinc-500 ml-1">Version</label><input type="text" value={metadata.version} onChange={event => updateMetadata({ version: event.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] h-11 px-4 text-[14px] font-bold text-[var(--text-primary)]" /><label className="text-[11px] font-bold text-zinc-500 ml-1">Description</label><textarea value={metadata.description} onChange={event => setMetadata({ ...metadata, description: event.target.value })} className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] p-4 text-[13px] font-semibold text-zinc-500 min-h-[100px] resize-none" /></div>}
                                    {sidebarTab === 'blocks' && <div className="space-y-3"><h3 className="text-[15px] font-bold text-[var(--text-primary)]">Structure blocks</h3>{parsedBlocks.length > 0 ? parsedBlocks.map((block, index) => <div key={index} className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px]"><Icons.Diamond size={16} weight="bold" /><span className="text-[13px] font-bold text-[var(--text-primary)]">{block}</span></div>) : <p className="text-[11px] font-bold text-zinc-500">No command blocks found yet.</p>}</div>}
                                    {sidebarTab === 'syntax' && <div className="grid grid-cols-1 gap-2">{[{ key: 'Ctrl + S', desc: 'Save changes' }, { key: 'Ctrl + SPACE', desc: 'Code suggestions' }].map((item, index) => <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-[8px]"><span className="text-[11px] font-bold text-zinc-500">{item.desc}</span><span className="text-[9px] font-bold text-[var(--text-primary)] bg-[var(--bg-primary)] px-2 py-1 rounded-[8px] border border-[var(--border-primary)] shadow-sm font-mono">{item.key}</span></div>)}</div>}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default PluginStudio;
