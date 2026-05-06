const asyncHandler = require('../../middleware/AsyncHandler');
const PollService = require('./Poll.Service');
const PollRepository = require('./Poll.Repository');
const TransformUtils = require('../../utils/Transform.Utils');
const { eventEmitter, EVENTS } = require('../../events');

/**
 * Poll Controller
 * Orchestrates voting interactions and real-time response aggregation.
 */
class PollController {
    /**
     * Records an identity's vote and broadcasts the update via event bus.
     */
    vote = asyncHandler(async (req, res) => {
        const { optionUuid } = req.params;
        const userId = req.user.uuid;

        const result = await PollService.vote(userId, optionUuid);

        // Retrieve context for event broadcasting via Repository
        const option = await PollRepository.findOptionWithPoll(optionUuid);

        if (option && option.poll) {
            eventEmitter.emit(EVENTS.POLL.UPDATED, {
                postId: option.poll.postId,
                poll: {
                    pollId: option.poll.uuid,
                    optionUuid,
                    voteCount: result.voteCount
                }
            });
        }

        res.success({ 
            option: {
                uuid: result.uuid,
                optionText: result.optionText,
                voteCount: result.voteCount
            } 
        }, { message: 'Vote recorded successfully.' });
    });
}

module.exports = new PollController();
