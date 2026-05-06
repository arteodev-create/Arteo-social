const { POST_TYPES } = require('../../../core/Constants');
const Logger = require('../../../infra/logging/Logger.Service');
const prisma = require('../../../config/Prisma.Client');

class PostMutationRepository {
    constructor(model) {
        this.model = model;
        this.prisma = prisma;
    }

    async _adjustStat(tx, postId, field, delta) {
        return tx.postStat.upsert({
            where: { postId },
            create: {
                postId,
                [field]: delta > 0 ? delta : 0
            },
            update: {
                [field]: delta > 0 ? { increment: delta } : { decrement: Math.abs(delta) }
            }
        });
    }

    async createWithTransaction(postData, mediaData = []) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const post = await tx.post.create({
                    data: {
                        userId: postData.userId,
                        type: (postData.type || POST_TYPES.POST).toUpperCase(),
                        content: postData.content,
                        parentId: postData.parentId || null,
                        originalPostId: postData.originalPostId || null,
                        visibility: (postData.visibility || 'PUBLIC').toUpperCase(),
                        topic: postData.topic,
                        location: postData.location,
                        isEphemeral: postData.isEphemeral || false,
                        expiresAt: postData.expiresAt,
                        threadIndex: postData.threadIndex || 1,
                        threadTotal: postData.threadTotal || 1
                    }
                });

                await tx.postStat.create({ data: { postId: post.uuid } });

                if (mediaData && mediaData.length > 0) {
                    await tx.postMedia.createMany({
                        data: mediaData.map(m => ({
                            postId: post.uuid,
                            type: m.type,
                            url: m.url,
                            thumbnailUrl: m.thumbnailUrl || null,
                            blurHash: m.blurHash || null,
                            mimeType: m.mimeType,
                            size: m.size || 0,
                            width: m.width || null,
                            height: m.height || null,
                            displayOrder: m.displayOrder || 0
                        }))
                    });
                }

                if (post.parentId) {
                    await this._adjustStat(tx, post.parentId, 'replyCount', 1);
                }
                if (post.originalPostId) {
                    await this._adjustStat(tx, post.originalPostId, 'quoteCount', 1);
                }

                return post;
            });
        } catch (error) {
            Logger.error(`[PostMutationRepository] Transaction failure: ${error.message}`);
            throw error;
        }
    }

    async pruneExpired() {
        const now = new Date();
        return await this.model.deleteMany({
            where: { isEphemeral: true, expiresAt: { lt: now } }
        });
    }
}

module.exports = PostMutationRepository;
