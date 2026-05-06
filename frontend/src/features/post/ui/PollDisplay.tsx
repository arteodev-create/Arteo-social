import React, { useState, useEffect } from 'react';
import { Poll } from '@entities/post/model';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PollDisplayProps {
    poll: Poll;
    onVote?: (optionUuid: string) => void;
}

const PollDisplay: React.FC<PollDisplayProps> = ({ poll, onVote }) => {
    const { t } = useTranslation();
    const [voted, setVoted] = useState(!!poll.userVoteOptionId);

    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
    const isExpired = new Date(poll.expiresAt) < new Date();

    useEffect(() => {
        setVoted(!!poll.userVoteOptionId);
    }, [poll.userVoteOptionId]);

    const handleVote = (optionUuid: string) => {
        if (isExpired) return;
        setVoted(true);
        if (onVote) onVote(optionUuid);
    };

    return (
        <div className="my-4 space-y-2.5">
            {poll.options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round(((option.voteCount || 0) / totalVotes) * 100) : 0;
                const isUserChoice = poll.userVoteOptionId === option.uuid;

                return (
                    <button
                        key={option.uuid}
                        disabled={isExpired}
                        onClick={() => handleVote(option.uuid)}
                        className={`relative w-full group overflow-hidden rounded-[8px] border transition-all duration-300 ${isUserChoice
                            ? 'border-[var(--text-primary)] bg-[var(--bg-primary)]'
                            : 'border-[var(--border-primary)] hover:border-[var(--text-muted)] bg-[var(--bg-secondary)]'
                            }`}
                    >
                        {(voted || isExpired) && (
                            <div
                                className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${isUserChoice
                                    ? 'bg-[var(--text-primary)]/20'
                                    : 'bg-[var(--text-primary)]/10'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        )}

                        <div className="relative px-4 py-3.5 flex items-center justify-between text-[15px]">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`font-bold truncate ${isUserChoice ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    {option.optionText}
                                </span>
                                {isUserChoice && (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                )}
                            </div>
                            {(voted || isExpired) && (
                                <span className={`font-bold tabular-nums transition-all tracking-tight ${isUserChoice ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                    {percentage}%
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}

            <div className="flex items-center gap-2 text-[14px] text-zinc-400 px-1 font-bold transition-colors tracking-tight">
                <span>{totalVotes.toLocaleString()} {t('poll.votes')}</span>
                <span className="text-zinc-600">/</span>
                <span className={isExpired ? 'text-zinc-500' : 'text-blue-400/80'}>
                    {isExpired
                        ? t('poll.finished')
                        : `${t('poll.left')} ${formatDistanceToNow(new Date(poll.expiresAt), { locale: enUS })}`}
                </span>
            </div>
        </div>
    );
};

export default PollDisplay;
