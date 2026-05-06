import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/ui';
import MinimalInput from '../MinimalInput';

interface ResetPasswordStepProps {
    onRecover: (email: string) => Promise<void>;
    onComplete: (token: string, pass: string) => Promise<void>;
    onBack: () => void;
    loading: boolean;
}

const ResetPasswordStep: React.FC<ResetPasswordStepProps> = ({
    onRecover,
    onComplete,
    onBack,
    loading
}) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onRecover(email);
            setStep('verify');
        } catch (err) { }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onComplete(code, newPassword);
        } catch (err) { }
    };

    return (
        <div className="flex flex-col h-full space-y-8">
            {step === 'request' ? (
                <form onSubmit={handleRequest} className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-[12px] font-medium text-zinc-400 px-1">{t('auth.recovery_label')}</p>
                            <MinimalInput
                                placeholder={t('auth.placeholder_email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className="h-[64px]"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={!email || loading}
                            loading={loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.send_code')}
                        </Button>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleComplete} className="space-y-10">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <p className="text-[12px] font-medium text-zinc-400 px-1">{t('auth.verification_label')}</p>
                            <MinimalInput
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                className="h-[64px]"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-[12px] font-medium text-zinc-400 px-1">{t('auth.new_password_label')}</p>
                            <MinimalInput
                                type="password"
                                placeholder={t('auth.placeholder_password_new')}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-[64px]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={code.length !== 6 || newPassword.length < 8 || loading}
                            loading={loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.reset_password_now')}
                        </Button>
                        <button
                            type="button"
                            onClick={() => setStep('request')}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordStep;

