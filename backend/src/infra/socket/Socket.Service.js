const Logger = require('../../infra/logging/Logger.Service');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const IdentificationRepository = require('../../modules/identity/Identification.Repository');
const { jwt: jwtConfig } = require('../../config');
const { AppError, NotFoundError } = require('../../core/Errors');
const TraceMiddleware = require('../../middleware/Trace');
const { EVENTS } = require('../../events');

/**
 * Socket.Service
 * Orchestrates high-fidelity real-time connectivity and stateful communication.
 * Purified for version 14.1 (Integrated Intelligence).
 */
class SocketService {
    constructor() {
        this.io = null;
        this.activeUsers = new Map(); // userId -> Set of socketIds
        this.socketToUser = new Map(); // socketId -> userId
    }

    /**
     * Initializes the Socket.IO server with professional security middleware.
     */
    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: (origin, callback) => {
                    // Socket.IO Auto-Detection for browser and mobile clients
                    if (!origin) return callback(null, true);

                    const originHost = origin.replace(/^https?:\/\//, '').split(':')[0];
                    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(originHost);
                    
                    if (isLocal || process.env.NODE_ENV === 'development') {
                        return callback(null, true);
                    }

                    // [ABS-14.1] Cho phép nếu khớp với Domain cấu hình
                    if (process.env.DOMAIN && origin.includes(process.env.DOMAIN)) {
                        return callback(null, true);
                    }

                    Logger.error(`[Socket:CORS] Blocked Unauthorized Origin: ${origin}`);
                    callback(new Error(`Socket CORS violation: Origin [${origin}] not authorized.`));
                },
                methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
                credentials: true
            }
        });

        // Identity Handshake Middleware (Synchronized with Arteo Platinum Auth)
        this.io.use(async (socket, next) => {
            try {
                let token = socket.handshake.auth.token;
                if (!token) return next(AppError.badRequest('Authentication token required for signaling.'));

                // Defensive Strategy: Strip 'Bearer ' prefix for raw JWT verification
                if (token.startsWith('Bearer ')) {
                    token = token.slice(7);
                }

                const decoded = jwt.verify(token, jwtConfig.getAccessTokenSecret());

                // Payload Mapping: Arteo standard uses 'uuid'
                const userUuid = decoded.uuid || decoded.uid;
                const user = await IdentificationRepository.findByUuid(userUuid);

                if (!user) return next(new NotFoundError('Identity for signaling context'));

                // High-Fidelity Security: Session Rotation & Account State Audit
                const isSessionValid = !decoded.ver || user.sessionSalt === decoded.ver;
                
                // [ABS-14.1] Strict status verification
                const isAccountActive = user.status === 'ACTIVE' || user.accountState === 'ACTIVE';

                if (!isSessionValid) {
                    return next(AppError.forbidden('Security: Session has been rotated or invalidated.'));
                }

                if (!isAccountActive) {
                    return next(AppError.forbidden('Security: Account is not in an active state.'));
                }
                
                // Establish minimal secure socket context (Principle of Least Privilege)
                socket.user = {
                    uuid: user.uuid,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role || 'USER'
                };
                
                next();
            } catch (error) {
                Logger.error(`[SocketService] Real-time auth protocol failure: ${error.message}`, { 
                    stack: error.stack,
                    handshake: socket.handshake.auth 
                });
                next(AppError.internal(`Authentication protocol failure during handshake: ${error.message}`));
            }
        });

        this.io.on('connection', (socket) => {
            TraceMiddleware.runWithContext(socket.handshake.query.correlationId, () => {
                const userId = socket.user.uuid;
                Logger.info(`[SocketService] User ${socket.user.username} established connection.`);
                
                this._addActiveUser(userId, socket.id);
                socket.join(`user_${userId}`);

                // [ABS-14.1] Join Admin Intelligence Room if authorized
                if (socket.user.role === 'ADMIN') {
                    socket.join('admins');
                    Logger.info(`[SocketService] Admin ${socket.user.username} joined the Intelligence Room.`);
                }

                socket.on('disconnect', () => {
                    TraceMiddleware.runWithContext(null, () => {
                        Logger.info(`[SocketService] User ${socket.user.username} disconnected.`);
                        this._removeActiveUser(userId, socket.id);
                    });
                });




            });
        });

        return this.io;
    }

    _addActiveUser(userId, socketId) {
        if (!this.activeUsers.has(userId)) {
            this.activeUsers.set(userId, new Set());
        }
        this.activeUsers.get(userId).add(socketId);
        this.socketToUser.set(socketId, userId);
    }

    _removeActiveUser(userId, socketId) {
        const userSockets = this.activeUsers.get(userId);
        if (userSockets) {
            userSockets.delete(socketId);
            if (userSockets.size === 0) {
                this.activeUsers.delete(userId);
            }
        }
        this.socketToUser.delete(socketId);
    }

    /**
     * Broadcasts identity state changes (Online/Offline) to the platform.
     */
    broadcastUserStatus(userId, status) {
        if (this.io) {
            this.io.emit('userStatusChange', {
                userUuid: userId,
                status,
                lastActive: new Date()
            });
        }
    }

    /**
     * Retrieves all currently connected identities.
     */
    getActiveUsers() {
        return Array.from(this.activeUsers.keys());
    }

    /**
     * Checks if a specific identity profile is currently online.
     */
    isUserOnline(userId) {
        return this.activeUsers.has(userId);
    }

    /**
     * Signal delivery to a specific User Room.
     */
    emitToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(event, data);
        }
    }

    /**
     * Signal delivery to a specific Post Room (Discovery/Engagement).
     */
    emitToPost(postId, event, data) {
        if (this.io) {
            this.io.to(`post_${postId}`).emit(event, data);
        }
    }



    /**
     * Signal delivery to a specific Topic Category Room.
     */
    emitToTopic(topic, event, data) {
        if (this.io && topic) {
            const safeTopic = topic.toLowerCase().trim();
            this.io.to(`topic_${safeTopic}`).emit(event, data);
        }
    }

    /**
     * Universal broadcast to all active platform connections.
     */
    emitToAll(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    /**
     * Signal delivery to everyone EXCEPT the specified user.
     * Prevents 'Echo' effects where a user receives their own interaction signal.
     */
    emitToOthers(senderId, event, data) {
        if (this.io) {
            this.io.except(`user_${senderId}`).emit(event, data);
        }
    }

    /**
     * Signal delivery to the Arteo Admin Intelligence Room.
     */
    emitToAdmins(event, data) {
        if (this.io) {
            this.io.to('admins').emit(event, data);
        }
    }

    getIO() {
        return this.io;
    }
}

module.exports = new SocketService();
