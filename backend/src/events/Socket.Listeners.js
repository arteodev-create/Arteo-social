const Logger = require('../infra/logging/Logger.Service');
const { eventEmitter, EVENTS } = require('./index');
const SocketService = require('../infra/socket/Socket.Service');

/**
 * SocketListeners
 * Platinum Purified v1.1
 * Quản lý việc phát tán tín hiệu real-time qua Socket.
 */
class SocketListeners {
    constructor() {
        this._initialize();
    }

    _initialize() {
        Logger.info('🔌 Socket Event Listeners initialized (Real-time Signals Active).');

        // Lắng nghe sự kiện Cảm xúc (Reaction)
        eventEmitter.on(EVENTS.POST.REACTION_ADDED, (payload) => {
            Logger.info(`[SocketSignals] Broadcasting reaction for post ${payload.postId}`);
            SocketService.emitToOthers(payload.userId, 'post_reaction_updated', payload);
        });

        // Lắng nghe sự kiện Like
        eventEmitter.on(EVENTS.POST.LIKED, (payload) => {
            SocketService.emitToOthers(payload.userId, 'post_liked', payload);
        });

        eventEmitter.on(EVENTS.POST.UNLIKED, (payload) => {
            SocketService.emitToOthers(payload.userId, 'post_unliked', payload);
        });

        // Lắng nghe sự kiện Repost
        eventEmitter.on(EVENTS.POST.REPOSTED, (payload) => {
            SocketService.emitToOthers(payload.userId, 'post_reposted', payload);
        });

        // Lắng nghe sự kiện Comment
        eventEmitter.on(EVENTS.POST.COMMENTED, (payload) => {
            SocketService.emitToOthers(payload.userId, 'post_commented', payload);
        });

        // Lắng nghe sự kiện Xóa bài viết
        eventEmitter.on(EVENTS.POST.DELETED, (payload) => {
            SocketService.emitToAll('post_deleted', payload);
        });

        // [ABS-14.1 PLATINUM] Lắng nghe sự kiện cập nhật tuổi thọ bài viết
        eventEmitter.on('post_lifespan_updated', (payload) => {
            SocketService.emitToAll('post_lifespan_updated', payload);
        });
    }
}

module.exports = new SocketListeners();
