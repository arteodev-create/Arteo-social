const Logger = require('../../infra/logging/Logger.Service');
const { ReCodePluginParser } = require('@arteoapp/recode-plugin');
const CacheService = require('../../infra/cache/Cache.Service');
const AlgorithmRepository = require('./Algorithm.Repository');
const AlgorithmRegistry = require('./Algorithm.Registry');
const PluginRepository = require('../plugin/Plugin.Repository');
const { AppError, NotFoundError, AuthorizationError, ErrorCodes } = require('../../core/Errors');
const { ALGORITHM_CONSTANTS } = require('../../core/Constants');

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

        return currentPosts.map(p => ({
            ...p,
            _whiteBoxExplanation: {
                totalScore: p._score?.toFixed(4),
                steps: normalizedPipeline.map(s => s.id || s.command)
            }
        }));
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
                const match = trimmed.match(/use\s+([\w_]+)\(\)/);
                if (match) {
                    pipeline.push({ command: 'use', config: { plugin: match[1] } });
                }
            }
        });

        return pipeline;
    }

    /**
     * Management: Creation sequence.
     */
    async create(userId, data) {
        const { name, weights, description, pipeline, tags, version, isActive, isPublic } = data;
        const finalName = await AlgorithmRepository.findUniqueName(userId, name);
        
        Logger.info(`[AlgorithmService:Created] Establish: ${finalName} for identity ${userId}`);

        return await AlgorithmRepository.create({
            userId,
            name: finalName,
            weights: weights || {},
            pipeline: pipeline || '[]',
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

        return await AlgorithmRepository.update(uuid, {
            name: name !== undefined ? name : algo.name,
            weights: weights !== undefined ? weights : algo.weights,
            description: description !== undefined ? description : algo.description,
            pipeline: pipeline !== undefined ? pipeline : algo.pipeline,
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
        console.log('--- ACTIVATE REQUEST ---');
        console.log('User ID from Request:', userId);
        
        const algo = await AlgorithmRepository.findByUuid(uuid);
        if (!algo) {
            Logger.error(`[AlgorithmService:Error] Not found algorithm with UUID: ${uuid}`);
            throw new NotFoundError('Algorithm not found');
        }

        console.log('Algorithm Owner:', algo.userId);
        console.log('Algorithm isPublic:', algo.isPublic);

        const normalizedCurrentUserId = String(userId || '').toLowerCase().trim();
        const normalizedOwnerId = String(algo.userId || '').toLowerCase().trim();
        
        // NẾU KHÔNG CÓ USERID (401), CHÚNG TA NÊN BÁO LỖI AUTH TRƯỚC
        if (!normalizedCurrentUserId || normalizedCurrentUserId === 'undefined' || normalizedCurrentUserId === 'null' || !userId) {
            throw new AuthorizationError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }

        const isOwner = normalizedOwnerId === normalizedCurrentUserId;
        const isPublic = String(algo.isPublic) === 'true' || algo.isPublic === true || algo.isPublic === 1;

        if (!isOwner) {
            if (!isPublic) {
                Logger.error(`[AlgorithmService:Denied] Access Denied. Owner is ${normalizedOwnerId}, requester is ${normalizedCurrentUserId}`);
                throw new AuthorizationError('Quyền truy cập bị từ chối: Thuật toán này là riêng tư.');
            }
            
            Logger.info(`[AlgorithmService:AutoInstall] Bắt đầu tự động cài đặt thuật toán công khai cho ${userId}...`);
            await this.install(uuid, userId);
        }

        await AlgorithmRepository.deactivateAll(userId);
        
        // Sau khi install (nếu có), chúng ta cần tìm lại cái thuật toán mà người dùng đang sở hữu (bản clone) để activate
        const ownedAlgo = await AlgorithmRepository.model.findFirst({
            where: { 
                userId, 
                OR: [
                    { uuid: algo.uuid },
                    { installedFromId: algo.uuid }
                ],
                deletedAt: null 
            }
        });

        if (!ownedAlgo) throw new AppError('Lỗi kích hoạt: Không tìm thấy bản sao sở hữu.', 500);

        Logger.info(`[AlgorithmService:Activated] Thuật toán ${ownedAlgo.uuid} đã được kích hoạt cho người dùng ${userId}`);
        
        // Cache Invalidation
        CacheService.invalidateFeedPatterns(userId).catch(() => {});
        
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

        // CHỐNG TRÙNG LẶP: Kiểm tra xem đã cài từ nguồn này chưa
        const existingClone = await AlgorithmRepository.model.findFirst({
            where: { 
                userId, 
                installedFromId: original.uuid,
                deletedAt: null 
            }
        });

        if (existingClone) {
            Logger.info(`[AlgorithmService:Install] User ${userId} already has a clone of ${uuid}. Returning existing.`);
            return existingClone;
        }

        const finalName = await AlgorithmRepository.findUniqueName(userId, original.name);

        const installed = await AlgorithmRepository.create({
            userId,
            name: finalName,
            weights: original.weights || {},
            description: original.description,
            imageUrl: original.imageUrl,
            version: original.version,
            installedFromId: original.uuid,
            isActive: false,
            isPublic: false
        });

        Logger.info(`[AlgorithmService:Installed] Discovery cloning successful: ${original.uuid} -> ${installed.uuid}`);

        await AlgorithmRepository.update(uuid, { usageCount: { increment: 1 } });
        return installed;
    }

    /**
     * Management: Toggling operational state.
     */
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
            const installed = await this.install(uuid, userId);
            
            // Chuyển đối tượng algo sang bản clone vừa tạo
            algo = installed;
        }

        const pinnedCount = await AlgorithmRepository.countPinned(userId);
        if (pinnedCount >= 3) {
            throw new AppError('Bạn chỉ có thể ghim tối đa 3 thuật toán. Vui lòng bỏ ghim bớt một cái.', 400);
        }

        const lastPin = await AlgorithmRepository.findLastPin(userId);
        const newOrder = (lastPin?.pinOrder || 0) + 1;

        Logger.info(`[AlgorithmService:Pinned] Algorithm ${uuid} pinned for user ${userId} at position #${newOrder}`);
        return await AlgorithmRepository.update(uuid, { isPinned: true, pinOrder: newOrder });
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
