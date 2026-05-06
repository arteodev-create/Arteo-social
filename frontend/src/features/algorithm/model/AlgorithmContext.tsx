import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { algorithmApi } from '@features/algorithm/api';
import { useAuth } from '@entities/session/model';
import { useSocket } from '@entities/session/model';

interface Algorithm {
    uuid: string;
    name: string;
    description?: string;
    isActive: boolean;
    isPublic?: boolean;
    isPinned?: boolean;
    pinOrder?: number;
}

interface AlgorithmContextType {
    algorithms: Algorithm[];
    activeAlgoUuid: string | null;
    isLoading: boolean;
    refreshAlgorithms: () => Promise<void>;
    setActiveAlgoUuid: (uuid: string | null) => void;
}

const AlgorithmContext = createContext<AlgorithmContextType | undefined>(undefined);

export const AlgorithmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const hasAccessToken = Boolean(token);
    const socket = useSocket();
    const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
    const [activeAlgoUuid, setActiveAlgoUuidState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAlgorithms = useCallback(async () => {
        if (!hasAccessToken) {
            try {
                const publicRes = await algorithmApi.getPublicAlgorithms();
                const publicAlgos = publicRes.success && Array.isArray(publicRes.data) ? publicRes.data : [];
                setAlgorithms(publicAlgos);
                setActiveAlgoUuidState(publicAlgos[0]?.uuid || "-1");
            } catch {
                setAlgorithms([]);
                setActiveAlgoUuidState("-1");
            }
            setIsLoading(false);
            return;
        }

        try {
            const publicPromise = algorithmApi.getPublicAlgorithms();
            const personalPromise = hasAccessToken
                ? algorithmApi.getAllAlgorithms().catch(() => ({ success: true, data: [] }))
                : Promise.resolve({ success: true, data: [] });
            const [personalRes, publicRes] = await Promise.all([personalPromise, publicPromise]);

            const personalAlgos = personalRes.success && Array.isArray(personalRes.data) ? personalRes.data : [];
            const publicAlgos = publicRes.success && Array.isArray(publicRes.data) ? publicRes.data : [];
            const rawAlgos = [...personalAlgos, ...publicAlgos].filter((algo, index, list) =>
                algo?.uuid && list.findIndex((item) => item?.uuid === algo.uuid) === index
            );

            if (rawAlgos.length > 0) {
                
                setAlgorithms(rawAlgos);
                const active = rawAlgos.find((a: any) => Boolean(a.isActive));
                if (active) {
                    setActiveAlgoUuidState(active.uuid);
                } else {
                    const firstAlgoUuid = rawAlgos[0].uuid;
                    setActiveAlgoUuidState(firstAlgoUuid);
                    if (hasAccessToken) {
                        algorithmApi.setActiveAlgorithm(firstAlgoUuid).catch((err: any) => {
                            console.error('[AlgorithmContext] Failed to auto-activate first algorithm:', err);
                        });
                    }
                }
            } else {
                setAlgorithms([]);
                setActiveAlgoUuidState("-1");
            }
        } catch (err: any) {
            console.error('[AlgorithmContext] Failed to fetch algorithms:', err);
            setActiveAlgoUuidState("-1");
        } finally {
            setIsLoading(false);
        }
    }, [hasAccessToken]);
    useEffect(() => {
        if (!socket) return;

        const handleAlgoUpdated = () => {
            console.log('[AlgorithmContext] Real-time signal received: Refreshing algorithms...');
            refreshAlgorithms();
        };

        socket.on('ALGORITHM_UPDATED', handleAlgoUpdated);
        socket.on('ALGO_ACTIVATED', handleAlgoUpdated);

        return () => {
            socket.off('ALGORITHM_UPDATED', handleAlgoUpdated);
            socket.off('ALGO_ACTIVATED', handleAlgoUpdated);
        };
    }, [refreshAlgorithms, socket]);
    useEffect(() => {
        refreshAlgorithms();
    }, [refreshAlgorithms]);

    const setActiveAlgoUuid = useCallback(async (uuid: string | null) => {
        setActiveAlgoUuidState(uuid);
        if (uuid !== null && uuid !== "-1" && hasAccessToken) {
            try {
                const res = await algorithmApi.setActiveAlgorithm(uuid);
                const activated = res?.data;
                if (activated?.uuid) {
                    setActiveAlgoUuidState(activated.uuid);
                }
                refreshAlgorithms();
            } catch (err: any) {
                console.error('[AlgorithmContext] Failed to persist active algorithm:', err);
                refreshAlgorithms();
            }
        }
    }, [hasAccessToken, refreshAlgorithms]);

    const value = {
        algorithms,
        activeAlgoUuid,
        isLoading,
        refreshAlgorithms,
        setActiveAlgoUuid
    };

    return (
        <AlgorithmContext.Provider value={value}>
            {children}
        </AlgorithmContext.Provider>
    );
};

export const useAlgorithms = () => {
    const context = useContext(AlgorithmContext);
    if (context === undefined) {
        throw new Error('useAlgorithms must be used within an AlgorithmProvider');
    }
    return context;
};
