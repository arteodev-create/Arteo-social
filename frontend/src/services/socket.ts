import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';


// Define event types for type safety
interface ServerToClientEvents {
    user_update: (user: any) => void;
    post_reaction_updated: (payload: any) => void;
    post_liked: (payload: any) => void;
    post_unliked: (payload: any) => void;
    post_reposted: (payload: any) => void;
    post_commented: (payload: any) => void;
    post_deleted: (payload: any) => void;
    post_lifespan_updated: (payload: any) => void;
    ALGORITHM_UPDATED: (payload: any) => void;
    ALGO_ACTIVATED: (payload: any) => void;
    admin_notification: (payload: { type: string; title: string; message: string; data: any }) => void;
}

interface ClientToServerEvents {
    // Minimal synchronized events are already filtered.
}

// Singleton socket instance
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
    return socket;
};

export const initSocket = (token: string) => {
    if (socket) {
        if ((socket.auth as any).token !== token) {
            (socket.auth as any).token = token;
            socket.disconnect().connect();
        }
        return socket;
    }

    const defaultApi = process.env.REACT_APP_API_URL || 'https://api-recode.arteosocial.com/api';
    const SOCKET_URL = defaultApi.replace(/\/api$/, '');

    socket = io(SOCKET_URL, {
        auth: {
            token: token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        window.dispatchEvent(new CustomEvent('arteo-socket-ready', { detail: { socketId: socket?.id } }));
    });

    socket.on('connect_error', (err: any) => {
        const errorMessage = err.message || 'Unknown socket error';
        console.error('[Socket] Connection failure:', errorMessage);
        if (errorMessage.includes('expired') || errorMessage.includes('auth')) {
            window.dispatchEvent(new CustomEvent('arteo-socket-auth-error', { detail: { error: err } }));
        }
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

