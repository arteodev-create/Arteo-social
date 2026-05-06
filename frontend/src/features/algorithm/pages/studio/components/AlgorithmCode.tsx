import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStudioStore } from '../useStudioStore';
import { Code2 } from 'lucide-react';

const AlgorithmCode: React.FC = () => {
    const { code, setCode } = useStudioStore();
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        
        // Define Custom Algorithm Language / Syntax Group
        monaco.languages.register({ id: 'algodsl' });
        
        // Very basic JSON/DSL styling for Majestic Platinum
        monaco.languages.setMonarchTokensProvider('algodsl', {
            tokenizer: {
                root: [
                    [/(?:algorithm|pipeline|boost|penalty|filter_out)\b/, 'keyword'],
                    [/"[^"]*"/, 'string'],
                    [/[0-9]+/, 'number'],
                    [/[{}()]/, 'delimiter'],
                    [/\b[A-Za-z0-9_]+\b/, 'identifier'],
                ]
            }
        });
        
        // Define Absolute Black Theme
        monaco.editor.defineTheme('platinum-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'ffffff', fontStyle: 'bold' },
                { token: 'string', foreground: 'aaaaaa' },
                { token: 'number', foreground: 'dddddd' },
                { token: 'comment', foreground: '555555', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#050505',
                'editor.lineHighlightBackground': '#111111',
                'editorCursor.foreground': '#FFFFFF',
                'editorIndentGuide.background': '#1A1A1A'
            }
        });
        monaco.editor.setTheme('platinum-dark');
    };

    return (
        <div className="w-full h-full rounded-[8px] overflow-hidden border border-[var(--border-primary)] shadow-sm bg-[var(--bg-primary)] flex flex-col">
            {/* Editor Tab Bar */}
            <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 flex items-center">
                <div className="flex items-center gap-2 px-3 h-7 bg-[var(--bg-primary)] rounded-[6px] border border-[var(--border-primary)] shadow-sm">
                    <Code2 size={12} className="text-zinc-500" />
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">logic.dsl</span>
                </div>
            </div>
            
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    language="algodsl"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        cursorBlinking: 'smooth',
                        renderLineHighlight: 'all',
                        lineHeight: 24,
                    }}
                />
            </div>
            
            {/* Editor Status Bar */}
            <div className="h-8 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-4 flex items-center justify-between text-[10px] font-bold text-zinc-500">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                        <div className="w-1.5 h-1.5 bg-[var(--text-primary)] rounded-[8px] animate-pulse" />
                        Core Active
                    </div>
                    <span>V14.1 ABS Sync</span>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <span>{code.split('\n').length} lines</span>
                    <span>UTF-8</span>
                    <span>DSL Pipeline</span>
                </div>
            </div>
        </div>
    );
};

export default AlgorithmCode;

