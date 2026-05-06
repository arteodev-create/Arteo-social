const BaseRepository = require('../../core/Base.Repository');
const { AppError } = require('../../core/Errors');

/**
 * Poll Repository
 * Data access layer for Poll entities and voting transactions.
 * Standardized as Instance-based per ABS v14.1.
 */
class PollRepository extends BaseRepository {
    constructor() {
        super('poll');
    }

    // Mapping offloaded to Platinum TransformUtils layer.


    /**
     * Finds a specific poll option including its parent poll context.
     */
    async findOptionWithPoll(optionUuid) {
        const option = await this.prisma.pollOption.findUnique({
            where: { uuid: optionUuid },
            include: { poll: true }
        });
        return option; // Keep context raw for internal logic, map at service level
    }

    /**
     * Establishes a new poll with atomic option association.
     */
    async create(postId, question, validOptions, expiresAt) {
        return await this.prisma.$transaction(async (tx) => {
            return await tx.poll.create({
                data: {
                    postId,
                    question: question.trim(),
                    expiresAt,
                    options: {
                        create: validOptions.map((opt, index) => ({
                            optionText: opt.trim(),
                            optionOrder: index
                        }))
                    }
                },
                include: { options: true }
            });
        });
    }

    /**
     * Records an identity's vote using a professional atomic swap/create transaction.
     */
    async vote(userId, optionUuid) {
        return await this.prisma.$transaction(async (tx) => {
            const option = await tx.pollOption.findUnique({
                where: { uuid: optionUuid },
                include: { poll: true }
            });

            if (!option) throw AppError.internal('Poll option not identified on this Arteo Node.');
            if (!option.poll) throw AppError.internal('Parent Poll context missing.');

            if (new Date(option.poll.expiresAt) < new Date()) {
                throw AppError.badRequest('This poll has reached its expiration threshold.');
            }

            const existingVote = await tx.pollVote.findUnique({
                where: {
                    userId_pollId: {
                        userId,
                        pollId: option.pollId
                    }
                }
            });

            if (existingVote) {
                if (existingVote.optionUuid === optionUuid) {
                    throw AppError.badRequest('Identity has already registered a vote for this specific option.');
                }
                
                await tx.pollOption.update({
                    where: { uuid: existingVote.optionUuid },
                    data: { voteCount: { decrement: 1 } }
                });

                await tx.pollVote.delete({
                    where: {
                        userId_pollId: {
                            userId,
                            pollId: option.pollId
                        }
                    }
                });
            }

            await tx.pollVote.create({
                data: {
                    userId,
                    pollId: option.pollId,
                    optionUuid
                }
            });

             return await tx.pollOption.update({
                where: { uuid: optionUuid },
                data: { voteCount: { increment: 1 } }
            });
        });
    }
}

module.exports = new PollRepository();
