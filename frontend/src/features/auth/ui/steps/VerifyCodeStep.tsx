import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { Button } from '@shared/ui';
import MinimalInput from '../MinimalInput';

interface VerifyCodeStepProps {
    email: string;
    code: string;
    onChange: (code: string) => void;
    onSubmit: () => void;
    onResend: () => Promise<void>;
    loading: boolean;
    countdown: number;
    onBack: () => void;
}

const VerifyCodeStep: React.FC<VerifyCodeStepProps> = ({
    email,
    code,
    onChange,
    onSubmit,
    onResend,
    loading,
    countdown,
    onBack
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col h-full space-y-10">
            <div className="space-y-10">
                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="space-y-3">
                        <p className="text-[12px] font-medium text-zinc-400 px-1">{t('auth.verification_label')}</p>
                        <div className="px-8 py-4 rounded-[8px] border border-zinc-200 bg-transparent">
                            <p className="text-[13px] text-zinc-500 font-medium text-center">
                                {t('auth.verify_sent_to')} <span className="text-black">{email}</span>
                            </p>
                        </div>
                    </div>

                    {/* Code Input */}
                    <div className="space-y-6">
                        <MinimalInput
                            placeholder="000000"
                            value={code}
                            onChange={(e) => onChange(e.target.value)}
                            maxLength={6}
                            className="h-[64px]"
                            autoFocus
                        />
                        
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[12px] text-zinc-500 font-medium">
                                {t('auth.didnt_receive_code')}
                            </p>
                            <button
                                type="button"
                                onClick={onResend}
                                disabled={countdown > 0 || loading}
                                className={`flex items-center gap-2 text-[13px] font-medium
                                    ${countdown > 0 || loading 
                                        ? 'text-zinc-700 cursor-not-allowed' 
                                        : 'text-black'}
                                `}
                            >
                                <ArrowCounterClockwise size={16} weight="bold" className={loading ? 'animate-spin' : ''} />
                                {countdown > 0 ? `${t('auth.resend_code')} (${countdown}s)` : t('auth.resend_code')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button
                        onClick={onSubmit}
                        disabled={code.length !== 6 || loading}
                        loading={loading}
                        className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                    >
                        {t('auth.verify_now')}
                    </Button>
                    
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                    >
                        {t('auth.back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyCodeStep;
