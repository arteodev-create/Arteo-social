const Logger = require('../../infra/logging/Logger.Service');
const { ReCodePluginParser } = require('@arteoapp/recode-plugin');
const CacheService = require('../../infra/cache/Cache.Service');
const AlgorithmRepository = require('./Algorithm.Repository');
const AlgorithmRegistry = require('./Algorithm.Registry');
const PluginRepository = require('../plugin/Plugin.Repository');
const PluginService = require('../plugin/Plugin.Service');
const { AppError, NotFoundError, AuthorizationError, ErrorCodes } = require('../../core/Errors');
const { ALGORITHM_CONSTANTS } = require('../../core/Constants');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_GLOBAL_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * AlgorithmService: Discovery & Content Delivery Engine.
 */
class AlgorithmService {
    constructor() {
        this.parser = new ReCodePluginParser();
        /**
         * Standardized Built-in Pipeline Blocks.
         */
        this.BUILTIN_BLOCKS = {
            'builtin_freshness': async (posts, config) => {
                const weight = parseFloat(config.weight ?? ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.FRESHNESS_WEIGHT);
                return posts.map(p => {
                    const ageHours = (Date.now() - new Date(p.createdAt).getTime()) / ALGORITHM_CONSTANTS.TIME_UNIT_MS;
                    const freshnessScore = Math.max(0, 1 - ageHours / ALGORITHM_CONSTANTS.FRESHNESS_BASELINE_HOURS);
                    const boost = freshnessScore * weight;
                    
                    const post = { ...p, _score: (p._score || 0) + boost };
                    this._addExplanation(post, 'Freshness', `Boosted by ${boost.toFixed(2)} based on age (${ageHours.toFixed(1)}h)`);
                    return post;
                });
            },
            'builtin_interactions': async (posts, config) => {
                const weight = parseFloat(config.weight ?? ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.INTERACTIONS_WEIGHT);
                const { WEIGHTS } = ALGORITHM_CONSTANTS;
                return posts.map(p => {
                    const stats = p.stats || {};
                    let score = (Number(stats.likeCount) || 0) * WEIGHTS.LIKE +
                        (Number(stats.repostCount) || 0) * WEIGHTS.REPOST +
                        (Number(stats.replyCount) || 0) * WEIGHTS.REPLY +
                        (Number(stats.quoteCount) || 0) * WEIGHTS.QUOTE;

                    // Apply Base Boost for active interactions (Quotes/Reposts)
                    // This ensures fresh activity is ranked higher even with 0 likes.
                    if (p.isRepostedDisplay) {
                        score += ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.BASE_REPOST_BOOST;
                    }
                    if (p.type?.toUpperCase() === 'QUOTE') {
                        score += ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.BASE_QUOTE_BOOST;
                    }
                    if (p.type?.toUpperCase() === 'THREAD') {
                        score += ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.BASE_THREAD_BOOST;
                    }

                    const boost = score * weight;
                    const post = { ...p, _score: (p._score || 0) + boost };
                    if (boost > 0) {
                        this._addExplanation(post, 'Interactions', `Popularity boost: +${boost.toFixed(2)}`);
                    }
                    return post;
                });
            },
            'builtin_topic_filter': async (posts, config) => {
                if (!config.topic) return posts;
                const target = config.topic.toLowerCase();
                return posts.filter(p => p.topic && p.topic.toLowerCase().includes(target));
            },
            'builtin_user_filter': async (posts, config) => {
                if (!config.username) return posts;
                const target = config.username.toLowerCase();
                return posts.filter(p => p.user && p.user.username.toLowerCase() === target);
            },
            'builtin_regional': async (posts, config) => {
                const weight = parseFloat(config.weight ?? ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.REGIONAL_WEIGHT);
                const userLocation = config.userLocation?.toLowerCase();
                if (!userLocation) return posts;

                return posts.map(p => {
                    let boost = 0;
                    if (p.location && p.location.toLowerCase().includes(userLocation)) boost += 2.0;
                    else if (p.user?.systemLocation && p.user.systemLocation.toLowerCase() === userLocation) boost += 1.2;
                    else if (p.user?.location && p.user.location.toLowerCase().includes(userLocation)) boost += 0.8;

                    return { ...p, _score: (p._score || 0) + (boost * weight) };
                });
            },
            'builtin_global': async (posts) => posts, 
            'builtin_diversify': async (posts, config) => {
                const limit = parseInt(config.limit_per_author || 1);
                const seen = {};
                const result = [];
                
                for (const post of posts) {
                    // ABS v14.1 Platinum: Strict ID normalization
                    const originalAuthorId = String(post.userId || post.user?.uuid || '').toLowerCase();
                    const reposterId = post.repostUser?.uuid ? String(post.repostUser.uuid).toLowerCase() : null;
                    
                    if (!originalAuthorId) continue;

                    const isOriginalSeen = (seen[originalAuthorId] || 0) >= limit;
                    const isReposterSeen = reposterId && (seen[reposterId] || 0) >= limit;

                    if (!isOriginalSeen && !isReposterSeen) {
                        seen[originalAuthorId] = (seen[originalAuthorId] || 0) + 1;
                        if (reposterId) seen[reposterId] = (seen[reposterId] || 0) + 1;
                        
                        this._addExplanation(post, 'Diversification', `Authorized: Unique identity pool (Limit: ${limit})`);
                        result.push(post);
                    }
                }
                return result;
            },
            'builtin_sort': async (posts) => [...posts].sort((a, b) => (b._score || 0) - (a._score || 0))
        };
    }

    /**
     * Main sorting engine orchestrator.
     */
    async sortPostsByAlgorithm(posts, userId, context = {}) {
        if (!posts || posts.length === 0) return posts;

        const algo = context.algorithm !== undefined ? context.algorithm : await this.getActiveAlgorithm(userId);
        const pipeline = (algo && algo.pipeline && algo.pipeline.length > 0) ? algo.pipeline : [
            { id: 'builtin_freshness', config: { weight: ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.FRESHNESS_WEIGHT } },
            { id: 'builtin_regional', config: { weight: ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.REGIONAL_WEIGHT } },
            { id: 'builtin_interactions', config: { weight: ALGORITHM_CONSTANTS.DEFAULT_PIPELINE.INTERACTIONS_WEIGHT } },
            { id: 'builtin_diversify', config: { limit_per_author: 1 } }, // Enforce diversification by default
            { id: 'builtin_sort' }
        ];

        // Ensure default pipeline also has the limit metadata if it's the fallback
        if (!algo) {
            pipeline.limit_per_author = 1;
        }

        const augmentedContext = { ...context, currentUserId: userId, algorithm: algo };
        return await this.runPipeline(posts, pipeline, augmentedContext);
    }

    /**
     * Resolves the currently active algorithm pipeline for a verified identity.
     */
    async getActiveAlgorithm(userId) {
        if (!userId) return null;
        const algo = await AlgorithmRepository.findActive(userId);
        if (!algo) return null;
        
        let weights = algo.weights;
        if (typeof weights === 'string' && weights.trim().startsWith('{')) {
            try { weights = JSON.parse(weights); } catch (e) {
                Logger.error(`[AlgorithmService] Weights parse failure for ${algo.uuid}`);
            }
        }

        // ABS v14.1: Prioritize the specialized 'pipeline' column for DSL/Logic storage.
        // Falls back to weights.code (Legacy Studio) or weights.pipeline if needed.
        const pipeline = algo.pipeline || weights?.code || weights?.pipeline || (Array.isArray(weights) ? weights : []);

        return { 
            uuid: algo.uuid, 
            name: algo.name, 
            version: algo.version,
            description: algo.description,
            installedFromId: algo.installedFromId,
            pluginDependencies: Array.isArray(weights?.pluginDependencies) ? weights.pluginDependencies : [],
            pipeline,
            limit_per_author: weights?.limit_per_author || algo.limit_per_author || 1
        };
    }

    /**
     * Resolves the exact feed algorithm requested by the client.
     */
    async getAlgorithmForFeed(uuid, userId) {
        if (!uuid || uuid === '-1') return null;

        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) return null;

        const isOwner = String(algo.userId || '').toLowerCase() === String(userId || '').toLowerCase();
        if (!isOwner && !algo.isPublic) {
            throw new AuthorizationError('Access denied: Confidential algorithm.');
        }

        let weights = algo.weights;
        if (typeof weights === 'string' && weights.trim().startsWith('{')) {
            try {
                weights = JSON.parse(weights);
            } catch (e) {
                Logger.error(`[AlgorithmService] Weights parse failure for selected feed ${uuid}`);
            }
        }

        const pipeline = algo.pipeline || weights?.code || weights?.pipeline || (Array.isArray(weights) ? weights : []);

        return {
            uuid: algo.uuid,
            name: algo.name,
            version: algo.version,
            description: algo.description,
            installedFromId: algo.installedFromId,
            pluginDependencies: Array.isArray(weights?.pluginDependencies) ? weights.pluginDependencies : [],
            pipeline,
            limit_per_author: weights?.limit_per_author || algo.limit_per_author || 1
        };
    }

    /**
     * Executes the multi-step discovery pipeline in sequence.
     * Refactored to support both Built-in and DSL commands.
     */
    async runPipeline(posts, pipeline, context = {}) {
        let currentPosts = posts.map(p => ({ 
            ...p, 
            _score: 0,
            _whiteBoxExplanation: {
                totalScore: 0,
                path: []
            }
        }));

        // ABS v14.1 Platinum: Initial strict diversification if specified in context
        const initialLimit = context.algorithm?.limit_per_author || context.limit_per_author;
        if (initialLimit) {
            currentPosts = await this.BUILTIN_BLOCKS['builtin_diversify'](currentPosts, { 
                limit_per_author: initialLimit 
            });
        }
        
        // Normalize pipeline
        let normalizedPipeline = pipeline;
        if (typeof pipeline === 'string') {
            normalizedPipeline = this.parseDSLToPipeline(pipeline);
        }

        for (const step of normalizedPipeline) {
            const { id, command, config = {} } = step;
            const stepConfig = { ...config, ...context };

            // 1. Plugin/Registry Blocks (ABS v15.0)
            if (id && id.includes(':')) {
                await this._ensurePluginBlockRegistered(id);
                currentPosts = await AlgorithmRegistry.executeBlock(id, currentPosts, stepConfig, context);
                continue;
            }

            // 2. Built-in blocks
            if (id && id.startsWith('builtin_')) {
                const blockFn = this.BUILTIN_BLOCKS[id];
                if (blockFn) currentPosts = await blockFn(currentPosts, stepConfig);
                continue;
            }

            // 3. Arteo Standard Step/Action interpretation
            const action = step.action || config.action;
            const stepType = step.step || id;

            if (stepType === 'shuffling' && action === 'diversify_authors') {
                currentPosts = await this.BUILTIN_BLOCKS['builtin_diversify'](currentPosts, { 
                    limit_per_author: step.limit_per_author || config.limit_per_author 
                });
            } else if (stepType === 'media_enrichment' && action === 'boost_high_res') {
                const multiplier = step.multiplier || config.multiplier || 1.5;
                currentPosts = currentPosts.map(p => {
                    const hasMedia = p.media && p.media.length > 0;
                    const finalScore = (p._score || 0) * (hasMedia ? multiplier : 1.0);
                    const post = { ...p, _score: finalScore };
                    if (hasMedia) {
                        this._addExplanation(post, 'Media Priority', `Visual boost: x${multiplier}`);
                    }
                    return post;
                });
            } else if (command === 'boost') {
                const target = String(config.target || '').toLowerCase();
                if (['recent', 'fresh', 'freshness'].includes(target)) {
                    currentPosts = await this.BUILTIN_BLOCKS['builtin_freshness'](currentPosts, { weight: config.weight });
                } else if (['popular', 'interaction', 'interactions'].includes(target)) {
                    currentPosts = await this.BUILTIN_BLOCKS['builtin_interactions'](currentPosts, { weight: config.weight });
                } else if (['media', 'visual', 'image'].includes(target)) {
                    const weight = parseFloat(config.weight || 1);
                    currentPosts = currentPosts.map(p => {
                        const hasMedia = p.media && p.media.length > 0;
                        const boost = hasMedia ? weight : 0;
                        const post = { ...p, _score: (p._score || 0) + boost };
                        if (hasMedia) this._addExplanation(post, 'Media', `Boosted by ${boost.toFixed(2)} for media`);
                        return post;
                    });
                }
            } else if (command === 'filter_out') {
                const criterion = String(config.criterion || '').toLowerCase();
                if (criterion) {
                    currentPosts = currentPosts.filter(p => {
                        const haystack = [
                            p.topic,
                            p.content,
                            p.user?.username,
                            ...(Array.isArray(p.tags) ? p.tags : [])
                        ].filter(Boolean).join(' ').toLowerCase();
                        return !haystack.includes(criterion);
                    });
                }
            } else if (command === 'use' && config.plugin) {
                try {
                    await this._ensurePluginBlockRegistered(config.plugin);
                    currentPosts = await AlgorithmRegistry.executeBlock(config.plugin, currentPosts, stepConfig, context);
                } catch (error) {
                    Logger.warn(`[AlgorithmService] Plugin block skipped: ${config.plugin} (${error.message})`);
                }
            }
        }

        // ABS v15.0 Platinum: MANDATORY FINAL AUTHOR SHIELD
        // We force limit_per_author: 1 as the ultimate platform invariant.
        const finalLimit = 1; 
        currentPosts = await this.BUILTIN_BLOCKS['builtin_diversify'](currentPosts, { 
            limit_per_author: finalLimit 
        });

        if (!normalizedPipeline.some(s => s.id === 'builtin_sort')) {
            currentPosts.sort((a, b) => (b._score || 0) - (a._score || 0));
        }

        const executedSteps = normalizedPipeline
            .map(s => s.id || s.command)
            .filter(Boolean);

        return currentPosts.map(p => {
            const existingExplanation = p._whiteBoxExplanation || {};
            return {
                ...p,
                _whiteBoxExplanation: {
                    ...existingExplanation,
                    totalScore: Number.isFinite(Number(p._score)) ? Number(p._score).toFixed(4) : '0.0000',
                    steps: executedSteps,
                    path: Array.isArray(existingExplanation.path) ? existingExplanation.path : [],
                    algorithm: context.algorithm ? {
                        uuid: context.algorithm.uuid,
                        name: context.algorithm.name,
                        version: context.algorithm.version,
                        installedFromId: context.algorithm.installedFromId
                    } : null,
                    pluginDependencies: Array.isArray(context.algorithm?.pluginDependencies)
                        ? context.algorithm.pluginDependencies
                        : []
                }
            };
        });
    }

    /**
     * Basic DSL Parser for Arteo Algorithm Studio.
     * Converts "boost recent by 50" -> { command: 'boost', config: { target: 'recent', weight: 50 } }
     */
    parseDSLToPipeline(dsl) {
        if (!dsl) return [];
        const lines = dsl.split('\n');
        const pipeline = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('boost ')) {
                const match = trimmed.match(/boost\s+(\w+)\s+by\s+(\d+)/);
                if (match) {
                    pipeline.push({ command: 'boost', config: { target: match[1], weight: parseInt(match[2]) } });
                }
            } else if (trimmed.startsWith('filter_out ')) {
                const match = trimmed.match(/filter_out\s+(\w+)/);
                if (match) {
                    pipeline.push({ command: 'filter_out', config: { criterion: match[1] } });
                }
            } else if (trimmed.startsWith('use ')) {
                const match = trimmed.match(/use\s+([\w:-]+)\(\)/);
                if (match) {
                    pipeline.push({ command: 'use', config: { plugin: match[1] } });
                }
            }
        });

        return pipeline;
    }

    async _ensurePluginBlockRegistered(blockId) {
        if (!blockId || !String(blockId).includes(':') || AlgorithmRegistry.getBlock(blockId)) return;
        const [pluginUuid] = String(blockId).split(':');
        if (!UUID_PATTERN.test(pluginUuid)) return;

        const plugin = await PluginRepository.findByUuid(pluginUuid);
        if (plugin?.blocksMetadata) {
            AlgorithmRegistry.registerPlugin(plugin.uuid, plugin.blocksMetadata);
        }
    }

    _normalizeObject(value, fallback) {
        if (value === undefined || value === null) return fallback;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) return value;
            try {
                return JSON.parse(trimmed);
            } catch {
                return value;
            }
        }
        return value;
    }

    _collectPluginDependencyIds(weights, pipeline) {
        const ids = new Set();
        const visit = (value, key = '') => {
            if (!value) return;
            if (typeof value === 'string') {
                if (UUID_PATTERN.test(value)) {
                    ids.add(value);
                } else {
                    const matches = value.match(UUID_GLOBAL_PATTERN) || [];
                    matches.forEach((match) => ids.add(match));
                }
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((item) => visit(item, key));
                return;
            }
            if (typeof value !== 'object') return;

            const dependencyKeys = new Set([
                'pluginId',
                'pluginUuid',
                'sourcePluginId',
                'installedPluginId',
                'localPluginId',
                'uuid'
            ]);

            Object.entries(value).forEach(([childKey, childValue]) => {
                if (dependencyKeys.has(childKey) && typeof childValue === 'string' && UUID_PATTERN.test(childValue)) {
                    ids.add(childValue);
                    return;
                }
                if (['pluginDependencies', 'pluginPacks', 'plugins', 'dependencies', 'pipeline', 'config'].includes(childKey) || key === 'pluginDependencies') {
                    visit(childValue, childKey);
                }
            });
        };

        visit(weights);
        visit(pipeline);
        return Array.from(ids);
    }

    _rewritePluginIds(value, idMap) {
        if (!value || idMap.size === 0) return value;
        if (typeof value === 'string') {
            if (idMap.has(value)) return idMap.get(value);
            return Array.from(idMap.entries()).reduce(
                (text, [sourceId, localId]) => text.replaceAll(sourceId, localId),
                value
            );
        }
        if (Array.isArray(value)) return value.map((item) => this._rewritePluginIds(item, idMap));
        if (typeof value !== 'object') return value;
        return Object.entries(value).reduce((acc, [key, child]) => {
            acc[key] = this._rewritePluginIds(child, idMap);
            return acc;
        }, {});
    }

    async _resolvePluginDependenciesForUser(userId, weightsInput, pipelineInput) {
        const weights = this._normalizeObject(weightsInput, {});
        const pipeline = this._normalizeObject(pipelineInput, []);
        const dependencyIds = this._collectPluginDependencyIds(weights, pipeline);
        const idMap = new Map();
        const dependencies = [];
        const resolvedSourceIds = new Set();

        for (const pluginId of dependencyIds) {
            const candidate = await PluginRepository.findByUuid(pluginId);
            if (!candidate) throw new NotFoundError(`Plugin dependency ${pluginId}`);

            const isLocalDownloadedCopy = Boolean(candidate.installedFromId) &&
                String(candidate.authorId || '').toLowerCase() === String(userId || '').toLowerCase();
            const source = isLocalDownloadedCopy
                ? (await PluginRepository.findByUuid(candidate.installedFromId)) || candidate
                : candidate;
            const localCopy = isLocalDownloadedCopy ? candidate : null;
            if (resolvedSourceIds.has(source.uuid)) {
                if (localCopy) idMap.set(localCopy.uuid, localCopy.uuid);
                continue;
            }
            resolvedSourceIds.add(source.uuid);

            const isOwner = String(source.authorId || '').toLowerCase() === String(userId || '').toLowerCase();
            if (!isOwner && !source.isPublic) {
                throw new AuthorizationError('Algorithm depends on a private plugin you cannot access.');
            }

            const existingLocal = isOwner ? null : (localCopy || await PluginRepository.findInstalledCopy(source, userId));
            const local = isOwner ? source : (existingLocal || await PluginService.install(source.uuid, userId));
            idMap.set(source.uuid, local.uuid);
            if (localCopy) idMap.set(localCopy.uuid, localCopy.uuid);
            dependencies.push({
                sourcePluginId: source.uuid,
                localPluginId: local.uuid,
                name: source.name,
                version: source.version || '1.0.0',
                blockCount: Array.isArray(source.blocksMetadata) ? source.blocksMetadata.length : 0,
                wasDownloaded: !isOwner && !existingLocal && local.uuid !== source.uuid,
                alreadyDownloaded: !isOwner && Boolean(existingLocal),
                alreadyAvailable: isOwner || Boolean(existingLocal) || local.uuid === source.uuid
            });
        }

        const resolvedWeights = typeof weights === 'object' && !Array.isArray(weights)
            ? {
                ...this._rewritePluginIds(weights, idMap),
                pluginDependencies: dependencies
            }
            : weights;

        return {
            weights: resolvedWeights,
            pipeline: this._rewritePluginIds(pipeline, idMap),
            dependencies
        };
    }

    _buildInstallMeta(resolved) {
        const dependencies = Array.isArray(resolved?.dependencies) ? resolved.dependencies : [];
        const downloadedDependencies = dependencies.filter((dependency) => dependency.wasDownloaded);
        return {
            dependencies,
            downloadedDependencies,
            dependencySummary: {
                total: dependencies.length,
                downloaded: downloadedDependencies.length
            }
        };
    }

    /**
     * Management: Creation sequence.
     */
    async create(userId, data) {
        const { name, weights, description, pipeline, tags, version, isActive, isPublic } = data;
        const finalName = await AlgorithmRepository.findUniqueName(userId, name);
        const resolved = await this._resolvePluginDependenciesForUser(userId, weights || {}, pipeline || []);
        
        Logger.info(`[AlgorithmService:Created] Establish: ${finalName} for identity ${userId}`);

        return await AlgorithmRepository.create({
            userId,
            name: finalName,
            weights: resolved.weights || {},
            pipeline: resolved.pipeline || [],
            tags: tags || [],
            isActive: !!isActive,
            isPublic: !!isPublic,
            description: description || '',
            version: version || '1.0.0'
        });
    }

    /**
     * Management: Strategic update.
     */
    async update(uuid, userId, data) {
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm');
        if (algo.userId !== userId) throw new AuthorizationError('Identity mismatch: Modification denied.');

        Logger.info(`[AlgorithmService:Updated] Strategic rotation: ${uuid} for identity ${userId}`);

        const { name, weights, description, pipeline, tags, version, isActive, isPublic } = data;
        const nextWeights = weights !== undefined ? weights : algo.weights;
        const nextPipeline = pipeline !== undefined ? pipeline : algo.pipeline;
        const resolved = await this._resolvePluginDependenciesForUser(userId, nextWeights, nextPipeline);

        return await AlgorithmRepository.update(uuid, {
            name: name !== undefined ? name : algo.name,
            weights: resolved.weights,
            description: description !== undefined ? description : algo.description,
            pipeline: resolved.pipeline,
            tags: tags !== undefined ? tags : algo.tags,
            version: version !== undefined ? version : algo.version,
            isActive: isActive !== undefined ? !!isActive : algo.isActive,
            isPublic: isPublic !== undefined ? !!isPublic : algo.isPublic
        });
    }

    /**
     * Management: Pipeline activation.
     */
    async activate(uuid, userId) {
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm not found');

        const normalizedCurrentUserId = String(userId || '').toLowerCase().trim();
        const normalizedOwnerId = String(algo.userId || '').toLowerCase().trim();
        if (!normalizedCurrentUserId || normalizedCurrentUserId === 'undefined' || normalizedCurrentUserId === 'null') {
            throw new AuthorizationError('Session expired. Please sign in again.');
        }

        const isOwner = normalizedOwnerId === normalizedCurrentUserId;
        const isPublic = String(algo.isPublic) === 'true' || algo.isPublic === true || algo.isPublic === 1;
        let activationTarget = algo;

        if (!isOwner) {
            if (!isPublic) {
                Logger.error(`[AlgorithmService:Denied] Access denied. Owner is ${normalizedOwnerId}, requester is ${normalizedCurrentUserId}`);
                throw new AuthorizationError('Access denied: this algorithm is private.');
            }
            const installResult = await this.install(uuid, userId);
            activationTarget = installResult.algorithm || installResult;
        }

        await AlgorithmRepository.deactivateAll(userId);

        const ownedAlgo = activationTarget.userId === userId
            ? activationTarget
            : await AlgorithmRepository.model.findFirst({
                where: { userId, installedFromId: algo.uuid, deletedAt: null },
                orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }]
            });

        if (!ownedAlgo) throw new AppError('Activation failed: owned algorithm copy was not found.', 500);

        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        CacheService.invalidateDiscoveryCache().catch(() => {});

        return await AlgorithmRepository.update(ownedAlgo.uuid, { isActive: true });
    }

    /**
     * Management: Discovery installation (Cloning).
     */
    async install(uuid, userId) {
        const original = await AlgorithmRepository.findByUuid(uuid);
        if (!original) throw new NotFoundError('Algorithm');

        const isOwner = String(original.userId).toLowerCase() === String(userId).toLowerCase();
        const isPublic = String(original.isPublic) === 'true' || original.isPublic === true || original.isPublic === 1;

        if (!isPublic && !isOwner) {
            throw new AppError('Discovery access denied: Algorithm is private.', 403, ErrorCodes.FORBIDDEN);
        }

        const resolved = await this._resolvePluginDependenciesForUser(
            userId,
            original.weights || {},
            original.pipeline || []
        );

        if (isOwner) {
            return {
                algorithm: original,
                ...this._buildInstallMeta(resolved)
            };
        }

        const existingClone = await AlgorithmRepository.model.findFirst({
            where: {
                userId,
                installedFromId: original.uuid,
                deletedAt: null
            },
            orderBy: [
                { isPinned: 'desc' },
                { isActive: 'desc' },
                { updatedAt: 'desc' }
            ]
        });

        if (existingClone) {
            Logger.info(`[AlgorithmService:Install] User ${userId} already has a clone of ${uuid}. Refreshing existing clone.`);
            const algorithm = await AlgorithmRepository.update(existingClone.uuid, {
                weights: resolved.weights || {},
                pipeline: resolved.pipeline || [],
                tags: original.tags || [],
                changelog: original.changelog || [],
                description: original.description,
                shortDescription: original.shortDescription,
                imageUrl: original.imageUrl,
                version: original.version,
                deletedAt: null
            });
            return {
                algorithm,
                ...this._buildInstallMeta(resolved)
            };
        }

        const finalName = await AlgorithmRepository.findUniqueName(userId, original.name);

        const installed = await AlgorithmRepository.create({
            userId,
            name: finalName,
            weights: resolved.weights || {},
            pipeline: resolved.pipeline || [],
            tags: original.tags || [],
            changelog: original.changelog || [],
            description: original.description,
            shortDescription: original.shortDescription,
            imageUrl: original.imageUrl,
            version: original.version,
            installedFromId: original.uuid,
            isActive: false,
            isPublic: false
        });

        Logger.info(`[AlgorithmService:Installed] Discovery cloning successful: ${original.uuid} -> ${installed.uuid}`);

        await AlgorithmRepository.update(uuid, { usageCount: { increment: 1 } });
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        return {
            algorithm: installed,
            ...this._buildInstallMeta(resolved)
        };
    }

    async toggleActive(uuid, userId) {
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm');
        if (algo.userId !== userId) throw new AuthorizationError();

        const newState = !algo.isActive;
        if (newState) {
            await AlgorithmRepository.deactivateAll(userId);
        }

        const result = await AlgorithmRepository.update(uuid, { isActive: newState });

        // Cache Invalidation: Ensure real-time consistency after state toggle
        CacheService.invalidateFeedPatterns(userId).catch(() => {});

        return result;
    }

    /**
     * Management: Strategic versioning.
     */
    async bumpVersion(uuid, userId, data) {
        const { version, weights } = data;
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm');
        if (algo.userId !== userId) throw new AuthorizationError();

        return await AlgorithmRepository.update(uuid, {
            version: version || algo.version,
            weights: weights || algo.weights
        });
    }

    /**
     * Management: Pinning favorite algorithms.
     * Constraint: Max 3 pins per user.
     */
    async pin(uuid, userId) {
        let algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm');

        // Nếu người dùng không sở hữu nhưng là thuật toán công khai -> Tự động cài đặt trước khi ghim
        if (algo.userId !== userId) {
            if (!algo.isPublic) {
                throw new AuthorizationError('Quyền sở hữu không hợp lệ: Thuật toán này là riêng tư.');
            }
            
            Logger.info(`[AlgorithmService:AutoInstallBeforePin] User ${userId} is pinning public algo ${uuid}. Installing clone first...`);
            const installResult = await this.install(uuid, userId);
            
            // Chuyển đối tượng algo sang bản clone vừa tạo
            algo = installResult.algorithm || installResult;
        }

        const pinnedCount = await AlgorithmRepository.countPinned(userId);
        if (pinnedCount >= 3) {
            throw new AppError('Bạn chỉ có thể ghim tối đa 3 thuật toán. Vui lòng bỏ ghim bớt một cái.', 400);
        }

        const lastPin = await AlgorithmRepository.findLastPin(userId);
        const newOrder = (lastPin?.pinOrder || 0) + 1;

        Logger.info(`[AlgorithmService:Pinned] Algorithm ${algo.uuid} pinned for user ${userId} at position #${newOrder}`);
        return await AlgorithmRepository.update(algo.uuid, { isPinned: true, pinOrder: newOrder });
    }

    /**
     * Management: Unpinning algorithms.
     */
    async unpin(uuid, userId) {
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) throw new NotFoundError('Algorithm');
        if (algo.userId !== userId) throw new AuthorizationError('Quyền sở hữu không hợp lệ.');

        const removedOrder = algo.pinOrder;
        
        Logger.info(`[AlgorithmService:Unpinned] Algorithm ${uuid} unpinned for user ${userId}. Reordering others...`);
        const result = await AlgorithmRepository.update(uuid, { isPinned: false, pinOrder: 0 });
        
        // Reorder remaining pins
        await AlgorithmRepository.reorderPinsAfterUnpin(userId, removedOrder);
        
        return result;
    }

    /**
     * Internal: Appends a white-box explanation entry to a post.
     */
    _addExplanation(post, step, reasoning) {
        if (!post._whiteBoxExplanation) {
            post._whiteBoxExplanation = { totalScore: 0, path: [] };
        }
        post._whiteBoxExplanation.path.push({ step, reasoning, timestamp: new Date() });
        post._whiteBoxExplanation.totalScore = post._score;
    }
}

module.exports = new AlgorithmService();
