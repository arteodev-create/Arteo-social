import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStudioStore } from '../useStudioStore';
import { Icons } from '@shared/ui';
import { cn } from '@shared/lib';

// Majestic Platinum Custom Node
const PlatinumNode = ({ data }: { data: any }) => {
    const isBoost = data.isBoost;
    
    return (
        <div className={cn(
            "px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[8px] min-w-[160px] flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all group"
        )}>
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!w-1.5 !h-1.5 !bg-[var(--text-muted)] !border !border-[var(--bg-primary)] !rounded-[8px] !-top-1" 
            />
            
            <div className={cn(
                "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                isBoost ? "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-none shadow-black/10" : "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            )}>
                {isBoost ? <Icons.Boost size={16} /> : <Icons.Algorithm size={16} />}
            </div>
            
            <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-[var(--text-primary)] truncate leading-tight">{data.label}</span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">{isBoost ? 'Boost' : 'Core'}</span>
            </div>

            <Handle 
                type="source" 
                position={Position.Bottom} 
                className="!w-1.5 !h-1.5 !bg-[var(--text-muted)] !border !border-[var(--bg-primary)] !rounded-[8px] !-bottom-1" 
            />
        </div>
    );
};

const nodeTypes = {
    platinum: PlatinumNode,
    inputNode: PlatinumNode,
    boostNode: PlatinumNode,
    outputNode: PlatinumNode,
    core: PlatinumNode,
    boost: PlatinumNode
};

const Flow = () => {
    const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, setSelectedNodeId, setSidebarTab } = useStudioStore();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => addEdge({ 
            ...params, 
            type: 'smoothstep',
            animated: false, 
            style: { stroke: 'var(--text-primary)', strokeWidth: 1.5, opacity: 0.2 } 
        }, eds));
    }, [setEdges]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
        setSelectedNodeId(node.id);
        setSidebarTab('settings');
    }, [setSelectedNodeId, setSidebarTab]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');
            const rawData = event.dataTransfer.getData('application/data');
            const blockData = rawData ? JSON.parse(rawData) : {};

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `node_${Date.now()}`,
                type: 'platinum',
                position,
                data: { 
                    label: label || 'New Block', 
                    isBoost: type === 'boost',
                    description: blockData.description || '',
                    category: blockData.category || '',
                    version: blockData.version || '1.0.0'
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes, screenToFlowPosition]
    );

    return (
        <div className="w-full h-full rounded-[8px] overflow-hidden border border-[var(--border-primary)] shadow-none bg-[var(--bg-primary)] flex flex-col relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: 'var(--text-primary)', strokeWidth: 1.5, opacity: 0.2 }
                }}
                fitView
                fitViewOptions={{ padding: 0.5, maxZoom: 0.85 }}
                colorMode={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                snapToGrid={true}
                snapGrid={[16, 16]}
            >
                <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="var(--border-secondary)" />
                <Controls className="bg-[var(--bg-primary)] border-[var(--border-primary)] fill-[var(--text-primary)] shadow-none rounded-[8px] overflow-hidden p-1 gap-1" />
            </ReactFlow>
        </div>
    );
};

const AlgorithmCanvas: React.FC = () => {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
};

export default AlgorithmCanvas;

