const Logger = require('../../infra/logging/Logger.Service');

/**
 * AlgorithmRegistry: The central hub for discovery components.
 * Standardized for ABS v15.0 Platinum.
 */
class AlgorithmRegistry {
    constructor() {
        this.blocks = new Map();
        this.plugins = new Map();
    }

    /**
     * Registers a suite of blocks from a verified plugin.
     */
    registerPlugin(pluginUuid, blocks) {
        Logger.info(`[AlgorithmRegistry] Registering blocks for plugin: ${pluginUuid}`);
        
        if (!Array.isArray(blocks)) {
            Logger.warn(`[AlgorithmRegistry] Invalid blocks metadata for plugin ${pluginUuid}`);
            return;
        }

        blocks.forEach(block => {
            const blockId = `${pluginUuid}:${block.id}`;
            this.blocks.set(blockId, {
                ...block,
                pluginUuid,
                registeredAt: new Date()
            });
        });

        this.plugins.set(pluginUuid, blocks.map(b => b.id));
    }

    /**
     * Resolves a block definition by its global ID.
     */
    getBlock(blockId) {
        return this.blocks.get(blockId);
    }

    /**
     * Lists all available discovery blocks.
     */
    listAllBlocks() {
        return Array.from(this.blocks.values());
    }

    /**
     * Internal: Executes a block's logic.
     * Note: In a real environment, this would involve sandboxed JS execution for safety.
     */
    async executeBlock(blockId, posts, config, context) {
        const block = this.getBlock(blockId);
        if (!block) {
            Logger.error(`[AlgorithmRegistry] Attempted execution of unknown block: ${blockId}`);
            return posts;
        }

        Logger.info(`[AlgorithmRegistry] Executing block: ${blockId}`);
        
        // Placeholder for sandboxed execution or built-in mapping
        // For now, we map specific IDs to built-in functions for demonstration
        return posts; 
    }
}

module.exports = new AlgorithmRegistry();
