/**
 * Bi-directional Compiler for Algorithm Studio
 * Handles conversions between XYFlow (Nodes/Edges) and the textual DSL (Code).
 */

export const compileNodesToDSL = (nodes: any[], edges: any[], metadata: any): string => {
    // 1. Kahn's Algorithm for Topological Sort
    const sortedNodes: any[] = [];
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    nodes.forEach(n => {
        inDegree.set(n.id, 0);
        adj.set(n.id, []);
    });

    edges.forEach(e => {
        adj.get(e.source)?.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    while (queue.length > 0) {
        const u = queue.shift()!;
        const node = nodes.find(n => n.id === u);
        if (node) sortedNodes.push(node);

        adj.get(u)?.forEach(v => {
            inDegree.set(v, (inDegree.get(v) || 0) - 1);
            if (inDegree.get(v) === 0) queue.push(v);
        });
    }

    // Fallback for safety if nodes are missing from edges
    if (sortedNodes.length < nodes.length) {
        const remaining = nodes.filter(n => !sortedNodes.find(s => s.id === n.id));
        sortedNodes.push(...remaining);
    }

    // Map Nodes to DSL Commands
    const pipelineCommands: string[] = [];
    
    sortedNodes.forEach(node => {
        const type = node.data?.type || (node.data?.isBoost ? 'boost' : 'unknown');
        const label = (node.data?.label || '').toLowerCase();
        
        if (type === 'boost' || label.includes('boost')) {
            const weight = node.data?.weight || 50;
            const name = label.replace('boost ', '').split(' ')[0] || 'recent';
            pipelineCommands.push(`        boost ${name} by ${weight}`);
        } else if (type === 'penalty' || label.includes('penalty')) {
            pipelineCommands.push(`        penalty ${label.replace('penalty ', '') || 'ignored by 20'}`);
        } else if (type === 'filter' || label.includes('filter')) {
            const criterion = node.data?.criterion || 'nsfw';
            pipelineCommands.push(`        filter_out ${criterion}`);
        } else if (type === 'core') {
            // Skip
        } else {
            if (!label.includes('input') && !label.includes('output')) {
                pipelineCommands.push(`        use ${label.replace(/\s+/g, '_')}()`);
            }
        }
    });

    // Construct full DSL
    return `algorithm "${metadata.name}" {
    version "${metadata.version}"
    description "${metadata.description}"
    
    pipeline "Discovery" {
${pipelineCommands.join('\n')}
    }
}`;
};

export const parseDSLToNodes = (code: string) => {
    if (!code) return { nodes: [], edges: [] };
    
    // 1. Extract pipeline block
    const pipelineMatch = code.match(/pipeline\s+"[^"]+"\s*\{([\s\S]*?)\}/);
    const pipelineContent = (pipelineMatch && pipelineMatch[1]) ? pipelineMatch[1] : '';
    
    // 2. Parse Commands
    const commands = pipelineContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const newNodes: any[] = [];
    const newEdges: any[] = [];
    
    // 3. Create Default Input Node
    newNodes.push({
        id: 'node_input',
        type: 'platinum',
        position: { x: 250, y: 50 },
        data: { label: 'Input Stream', type: 'core', isBoost: false }
    });

    let currentY = 200;
    let prevId = 'node_input';

    commands.forEach((cmd, idx) => {
        const id = `node_cmd_${idx}`;
        let label = cmd;
        let isBoost = false;
        let type = 'plugin';

        if (cmd.startsWith('boost')) {
            label = 'Boost ' + cmd.replace('boost ', '');
            isBoost = true;
            type = 'boost';
        } else if (cmd.startsWith('penalty')) {
            label = 'Penalty ' + cmd.replace('penalty ', '');
            type = 'penalty';
        } else if (cmd.startsWith('filter_out')) {
            label = 'Filter ' + cmd.replace('filter_out ', '');
            type = 'filter';
        } else if (cmd.startsWith('use ')) {
            label = cmd.replace('use ', '').replace('()', '');
        }

        newNodes.push({
            id,
            type: 'platinum',
            position: { x: 250, y: currentY },
            data: { label, type, isBoost }
        });

        newEdges.push({
            id: `edge_${prevId}_${id}`,
            source: prevId,
            target: id,
            animated: true,
            style: { stroke: '#000', strokeWidth: 2 }
        });

        prevId = id;
        currentY += 150;
    });

    // 4. Create Output Node
    const outId = 'node_output';
    newNodes.push({
        id: outId,
        type: 'platinum',
        position: { x: 250, y: currentY },
        data: { label: 'Final Output', type: 'core', isBoost: false }
    });

    newEdges.push({
        id: `edge_${prevId}_${outId}`,
        source: prevId,
        target: outId,
        animated: true,
        style: { stroke: '#000', strokeWidth: 2 }
    });

    return { nodes: newNodes, edges: newEdges };
};

