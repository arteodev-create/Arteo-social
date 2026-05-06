import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { compileNodesToDSL, parseDSLToNodes } from './utils/AlgorithmCompiler';
import { algorithmApi } from '@features/algorithm/api';
import { pluginApi } from '@features/plugin/api';
import { toast } from 'sonner';

export interface AlgorithmMetadata {
    name: string;
    description: string;
    version: string;
    is_public: boolean;
    tags: string[];
}

interface StudioState {
    // Current Loaded Algorithm UUID
    algorithmId: string | null;
    isLoading: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    
    // UI State
    activeView: 'canvas' | 'code';
    sidebarTab: 'settings' | 'library';
    
    // Algorithm State
    metadata: AlgorithmMetadata;
    code: string; // The DSL string for the engine
    nodes: any[]; // XYFlow Nodes
    edges: any[]; // XYFlow Edges
    selectedNodeId: string | null;
    lastSyncedCode: string; // To avoid unnecessary parsing when switching tabs
    
    // Library Data (Global cache to avoid re-fetching on tab switch)
    libraryPlugins: any[];
    isLibraryLoading: boolean;
    
    // Actions
    setAlgorithmId: (id: string | null) => void;
    setActiveView: (view: 'canvas' | 'code') => void;
    setSidebarTab: (tab: 'settings' | 'library') => void;
    setMetadata: (metadata: Partial<AlgorithmMetadata>) => void;
    setCode: (code: string) => void;
    setNodes: (nodes: any[] | ((nds: any[]) => any[])) => void;
    setEdges: (edges: any[] | ((eds: any[]) => any[])) => void;
    onNodesChange: (changes: any[]) => void;
    onEdgesChange: (changes: any[]) => void;
    setSelectedNodeId: (id: string | null) => void;
    updateNodeData: (id: string, data: any) => void;
    
    // Async Actions
    fetchAlgorithm: (uuid: string) => Promise<void>;
    fetchLibraryPlugins: () => Promise<void>;
    saveAlgorithm: () => Promise<{ success: boolean; data?: any }>;
    resetStudio: () => void;
}

const defaultCode = `algorithm "Rank Boost" {
    version "1.0.0"
    description "Core feed logic configuration"
    
    pipeline "Discovery" {
        boost recent by 50
        penalty ignored by 20
        filter_out nsfw
    }
}`;

const defaultNodes = [
    { id: 'input-1', type: 'inputNode', position: { x: 250, y: 50 }, data: { label: 'Input Stream' } },
    { id: 'boost-1', type: 'boostNode', position: { x: 250, y: 200 }, data: { label: 'Boost Recent (50)' } },
    { id: 'output-1', type: 'outputNode', position: { x: 250, y: 350 }, data: { label: 'Final Output' } }
];

const defaultEdges = [
    { id: 'e1-2', source: 'input-1', target: 'boost-1' },
    { id: 'e2-3', source: 'boost-1', target: 'output-1' }
];

const defaultMetadata: AlgorithmMetadata = {
    name: 'Rank Boost',
    description: 'Core feed logic configuration',
    version: '1.0.0',
    is_public: false,
    tags: ['core', 'discovery']
};

export const useStudioStore = create<StudioState>((set, get) => ({
    algorithmId: null,
    isLoading: false,
    saveStatus: 'idle',
    
    activeView: 'canvas',
    sidebarTab: 'library',
    
    metadata: { ...defaultMetadata },
    code: defaultCode,
    nodes: defaultNodes,
    edges: defaultEdges,
    selectedNodeId: null,
    lastSyncedCode: defaultCode,
    
    libraryPlugins: [],
    isLibraryLoading: false,
    
    setAlgorithmId: (id) => set({ algorithmId: id }),
    setActiveView: (view) => {
        const state = get();
        if (view === 'code' && state.activeView === 'canvas') {
            // Compile Canvas -> Code
            const newCode = compileNodesToDSL(state.nodes, state.edges, state.metadata);
            set({ code: newCode, activeView: view, lastSyncedCode: newCode });
        } else if (view === 'canvas' && state.activeView === 'code') {
            // Only parse if code was actually modified in the editor
            if (state.code !== state.lastSyncedCode) {
                try {
                    const { nodes, edges } = parseDSLToNodes(state.code);
                    set({ nodes, edges, activeView: view, lastSyncedCode: state.code });
                } catch (error) {
                    console.error("Failed to parse DSL", error);
                    toast.error("Source code has syntax errors, so the canvas may be inaccurate.");
                    set({ activeView: view });
                }
            } else {
                // Code is same as last sync, just switch view and keep layout
                set({ activeView: view });
            }
        } else {
            set({ activeView: view });
        }
    },
    setSidebarTab: (tab) => set({ sidebarTab: tab }),
    setMetadata: (updates) => set((state) => ({ metadata: { ...state.metadata, ...updates } })),
    setCode: (code) => set({ code }),
    setNodes: (nodesOrUpdater) => set((state) => ({
        nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater
    })),
    setEdges: (edgesOrUpdater) => set((state) => ({
        edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater
    })),
    onNodesChange: (changes) => set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes)
    })),
    onEdgesChange: (changes) => set((state) => ({
        edges: applyEdgeChanges(changes, state.edges)
    })),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    updateNodeData: (id, newData) => set((state) => ({
        nodes: state.nodes.map((node) => 
            node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        )
    })),
    
    fetchLibraryPlugins: async () => {
        const state = get();
        // Avoid duplicate fetching if data exists or loading
        if (state.libraryPlugins.length > 0 || state.isLibraryLoading) return;

        set({ isLibraryLoading: true });
        try {
            const res = await pluginApi.getAllPlugins();
            if (res.success && res.data) {
                let rawPlugins = Array.isArray(res.data.plugins) ? res.data.plugins : (Array.isArray(res.data) ? res.data : []);
                const sorted = rawPlugins.sort((a: any, b: any) => {
                    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
                    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
                    return dateB - dateA;
                });
                set({ libraryPlugins: sorted });
            }
        } catch (error) {
            console.error("Failed to fetch library plugins in store", error);
        } finally {
            set({ isLibraryLoading: false });
        }
    },
    
    fetchAlgorithm: async (uuid: string) => {
        set({ isLoading: true, algorithmId: uuid });
        try {
            const res = await algorithmApi.getAlgorithmById(uuid);
            if (res.success && res.data) {
                    const pipelineData = res.data.pipeline;
                    const loadedCode = (pipelineData !== undefined && pipelineData !== null)
                        ? (typeof pipelineData === 'string' ? pipelineData : JSON.stringify(pipelineData, null, 2))
                        : defaultCode;
                    let initialNodes = defaultNodes;
                    let initialEdges = defaultEdges;
                    
                    try {
                        const parsed = parseDSLToNodes(loadedCode);
                        initialNodes = parsed.nodes;
                        initialEdges = parsed.edges;
                    } catch (e) {
                        console.warn("Failed to parse initial DSL, using defaults", e);
                    }

                    set({
                        metadata: {
                            name: res.data.name || defaultMetadata.name,
                            description: res.data.description || defaultMetadata.description,
                            version: res.data.version || defaultMetadata.version,
                            is_public: res.data.isPublic || false,
                            tags: Array.isArray(res.data.tags) ? res.data.tags : []
                        },
                        code: loadedCode,
                        nodes: initialNodes,
                        edges: initialEdges,
                        lastSyncedCode: loadedCode
                    });
            }
        } catch (error) {
            console.error('Fetch algorithm failed:', error);
            toast.error('Failed to load algorithm data');
        } finally {
            set({ isLoading: false });
        }
    },
    
    saveAlgorithm: async () => {
        const { algorithmId, metadata, code } = get();
        set({ saveStatus: 'saving' });
        
        try {
            const payload = {
                name: metadata.name,
                description: metadata.description,
                version: metadata.version,
                isPublic: metadata.is_public,
                tags: metadata.tags,
                pipeline: code, // saving raw code DSL as part of JSON payload
                isActive: false
            };
            
            let res;
            if (algorithmId) {
                res = await algorithmApi.updateAlgorithm(algorithmId, payload);
            } else {
                res = await algorithmApi.createAlgorithm(payload);
            }
            
            if (res.success) {
                set({ saveStatus: 'saved' });
                // Return to idle state after 2 seconds
                setTimeout(() => set({ saveStatus: 'idle' }), 2000);
                return { success: true, data: res.data };
            } else {
                set({ saveStatus: 'error' });
                setTimeout(() => set({ saveStatus: 'idle' }), 2000);
                return { success: false };
            }
        } catch (error) {
            set({ saveStatus: 'error' });
            setTimeout(() => set({ saveStatus: 'idle' }), 2000);
            return { success: false };
        }
    },

    resetStudio: () => set({
        algorithmId: null,
        isLoading: false,
        saveStatus: 'idle',
        activeView: 'canvas',
        metadata: { ...defaultMetadata },
        code: defaultCode,
        nodes: defaultNodes,
        edges: defaultEdges,
        selectedNodeId: null,
        lastSyncedCode: defaultCode
    })
}));


