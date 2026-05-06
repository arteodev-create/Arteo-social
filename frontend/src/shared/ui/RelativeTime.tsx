import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface RelativeTimeProps {
    date: string | Date;
    className?: string;
}

const RelativeTime: React.FC<RelativeTimeProps> = ({ date, className }) => {
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((tick) => tick + 1);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return (
        <span className={className}>
            {formatDistanceToNow(dateObj, {
                addSuffix: false,
                locale: enUS,
            })}
        </span>
    );
};

export default RelativeTime;
