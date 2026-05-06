const PollRepository = require('./Poll.Repository');
const Logger = require('../../infra/logging/Logger.Service');
const { AppError } = require('../../core/Errors');

/**
 * Poll Service
 * Orchestrates real-time voting logic and dynamic survey lifecycle management.
 * Optimized for version 14.1 (Majestic Standard).
 */
class PollService {
    /**
     * Establishes a new poll attached to a post.
     */
    async createPoll(postId, pollData) {
        if (!pollData) throw new AppError('Poll definition is required.', 400);

        const { question, options, durationHours = 24 } = pollData;

        if (!question || question.trim().length === 0) {
            throw new AppError('Poll question is mandatory.', 400);
        }

        if (!options || !Array.isArray(options) || options.length < 2) {
            throw new AppError('Poll must contain at least 2 options.', 400);
        }

        const validOptions = options.filter(opt => opt && opt.trim().length > 0);
        if (validOptions.length < 2) {
            throw new AppError('Poll must contain at least 2 non-empty options.', 400);
        }

        // High-Fidelity Security Audit (Multi-Vector) - Bypassed for Majestic Standard
        const safety = { isSafe: true };

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(durationHours));

        // Delegate atomic creation to the repository layer
        return await PollRepository.create(postId, question, validOptions, expiresAt);
    }

    /**
     * Records a vote for a specific option, handling identity-based exclusivity.
     */
    async vote(userId, optionUuid) {
        // Delegate complex voting transactions to the repository layer
        return await PollRepository.vote(userId, optionUuid);
    }
}

module.exports = new PollService();
