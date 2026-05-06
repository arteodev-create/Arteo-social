import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Eye,
    EyeSlash
} from '@phosphor-icons/react';
import MinimalInput from '../MinimalInput';
import { Button } from '@shared/ui';
import { useModal } from '../../../../contexts/ModalContext';
import { MODAL_IDS } from '../../../../constants/modalIds';

interface RegisterStepProps {
    step: number;
    data: any;
    onChange: (data: any) => void;
    onBack: () => void;
    onNext: () => void;    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;    backendErrors?: Record<string, string>;
}

const PasswordStrength = ({ password }: { password: string }) => {
    const { t } = useTranslation();
    const [strength, setStrength] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        setStrength(s);

        if (s === 0) setFeedback('');
        else if (s === 1) setFeedback(t('auth.strength_weak'));
        else if (s === 2) setFeedback(t('auth.strength_fair'));
        else if (s === 3) setFeedback(t('auth.strength_good'));
        else setFeedback(t('auth.strength_strong'));
    }, [password, t]);

    if (!password) return null;

    return (
        <div className="space-y-3 px-1">
            <div className="flex gap-1.5 h-[3px]">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`flex-1 rounded-[8px] ${i <= strength ? (strength <= 2 ? 'bg-zinc-400' : 'bg-black') : 'bg-zinc-100'}`}
                    />
                ))}
            </div>
            <p className={`text-[10px] font-medium ${strength <= 2 ? 'text-zinc-400' : 'text-black'}`}>
                {feedback}
            </p>
        </div>
    );
};

const RegisterStep: React.FC<RegisterStepProps> = ({
    step,
    data,
    onChange,
    onBack,
    onNext,    onSubmit,
    loading,    backendErrors
}) => {
    const { t } = useTranslation();
    const { openModal } = useModal();
    const [showPassword, setShowPassword] = useState(false);
    const [hasSeenCommunityModal, setHasSeenCommunityModal] = useState(false);

    useEffect(() => {
        if (step === 2 && !hasSeenCommunityModal) {
            openModal(MODAL_IDS.COMMUNITY_RESPONSIBILITY);
            setHasSeenCommunityModal(true);
        }
    }, [step, hasSeenCommunityModal, openModal]);

    const handleInputChange = (field: string, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <>
            <div className="flex flex-col h-full space-y-12">
            {/* STEP 1: USERNAME */}
            {step === 1 && (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <MinimalInput
                                    placeholder={t('auth.placeholder_username_reg')}
                                    value={data.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    isError={!!backendErrors?.username}
                                    className="h-[64px]"
                                    autoFocus
                                    inputClassName="text-center"
                                />
                                {backendErrors?.username && (
                                    <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500 font-medium">Username can only contain letters, numbers, and underscores (_)</p>
                                )}
                                {data.username && data.username.length >= 3 && !/^[a-zA-Z0-9_]+$/.test(data.username) && (
                                    <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500 font-medium">Username can only contain letters, numbers, and underscores (_)</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            onClick={onNext}
                            disabled={!data.username || data.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(data.username) || loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.continue')}
                        </Button>
                        <button
                            onClick={onBack}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: EMAIL */}
            {step === 2 && (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="relative">
                            <MinimalInput
                                placeholder={t('auth.placeholder_email')}
                                value={data.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                isError={!!backendErrors?.email}
                                className="h-[64px]"
                                type="email"
                                autoFocus
                                inputClassName="text-center"
                            />
                            {backendErrors?.email && (
                                <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500 font-medium">{backendErrors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            onClick={onNext}
                            disabled={!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.continue')}
                        </Button>
                        <button
                            onClick={onBack}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: PASSWORD */}
            {step === 3 && (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <MinimalInput
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t('auth.placeholder_password_create')}
                                    value={data.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    isError={!!backendErrors?.password}
                                    className="h-[64px]"
                                    autoFocus
                                    inputClassName="text-center"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400"
                                >
                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                                {backendErrors?.password && (
                                    <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500 font-medium">{backendErrors.password}</p>
                                )}
                            </div>
                            <div className="px-10">
                                <PasswordStrength password={data.password} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            onClick={onNext}
                            disabled={data.password.length < 8 || loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.continue')}
                        </Button>
                        <button
                            onClick={onBack}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: SUMMARY & VERIFICATION */}
            {step === 4 && (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="p-8 rounded-[8px] border border-zinc-200 bg-zinc-50/70 space-y-6">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-medium text-zinc-400">Username</span>
                                <span className="text-[20px] font-medium text-black">@{data.username}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-medium text-zinc-400">Email</span>
                                <span className="text-[15px] font-medium text-black truncate max-w-[280px]">{data.email}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[11px] font-medium text-zinc-400">Server</span>
                                <span className="text-[15px] font-medium text-black">arteosocial.com</span>
                            </div>
                        </div>

                        <div className="px-10">
                            <p className="text-[13px] font-normal text-zinc-500 text-center leading-relaxed">
                                {t('auth.register_final_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        <Button
                            onClick={onSubmit}
                            loading={loading}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium bg-black text-white border-none active:scale-100"
                        >
                            {t('auth.create_account')}
                        </Button>
                        <button
                            onClick={onBack}
                            className="w-full h-[64px] rounded-[8px] text-[15px] font-medium border border-zinc-200 text-zinc-600"
                        >
                            {t('auth.back')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </>
    );
};


export default RegisterStep;

