import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-full shadow-none flex items-center gap-2 text-sm font-medium">
                <WifiOff className="w-4 h-4 text-red-400" />
                <span>You are offline</span>
            </div>
        </div>
    );
};

export default OfflineIndicator;
