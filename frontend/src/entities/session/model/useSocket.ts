import { useState, useEffect } from 'react';
import { getSocket } from '@services/socket';

/**
 * useSocket Hook
 * A reactive bridge to the Arteo Global Socket Singleton.
 * Ensures components re-render when the socket is initialized or updated.
 */
export const useSocket = () => {
    const [socket, setSocket] = useState(getSocket());

    useEffect(() => {
        // 1. Initial check: If socket exists, we're good
        const currentSocket = getSocket();
        if (currentSocket !== socket) {
            setSocket(currentSocket);
        }

        // 2. Listen for initialization events from service layer
        const handleSocketReady = () => {
            console.log('[useSocket] Detecting global socket readiness signal...');
            setSocket(getSocket());
        };

        window.addEventListener('arteo-socket-ready', handleSocketReady);

        return () => {
            window.removeEventListener('arteo-socket-ready', handleSocketReady);
        };
    }, [socket]);

    return socket;
};

