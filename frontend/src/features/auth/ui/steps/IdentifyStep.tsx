import React from 'react';
import MinimalInput from '../MinimalInput';
import { Button } from '@shared/ui';

interface IdentifyStepProps {
    step: number;
    identifier?: string;
    onIdentifierChange?: (val: string) => void;
    password?: string;
    onPasswordChange?: (val: string) => void;
    onSubmit?: (e: React.FormEvent) => void;
    loading: boolean;
    idError?: string | null;
    passError?: string | null;
    onForgotPassword?: () => void;
    onNext?: () => void;
    onBack?: () => void;
    rememberMe?: boolean;
    onRememberMeChange?: (val: boolean) => void;
    forceLight?: boolean;
}

const IdentifyStep: React.FC<IdentifyStepProps> = ({
    identifier,
    onIdentifierChange,
    password,
    onPasswordChange,
    onSubmit,
    loading,
    idError = null,
    passError = null,
    onForgotPassword
}) => {
    return (
        <div className="flex flex-col h-full">
            <form onSubmit={onSubmit} className="space-y-4">
                <MinimalInput
                    placeholder="Phone, username, or email"
                    value={identifier || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onIdentifierChange?.(e.target.value)}
                    isError={!!idError}
                    autoComplete="username"
                    className="h-[60px]"
                />

                <MinimalInput
                    placeholder="Password"
                    type="password"
                    value={password || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange?.(e.target.value)}
                    isError={!!passError || !!idError}
                    autoComplete="current-password"
                    className="h-[60px]"
                />

                {(idError || passError) ? (
                    <p className="px-1 text-[12px] text-red-500 font-medium">{idError || passError}</p>
                ) : null}

                <div className="pt-3">
                    <Button
                        type="submit"
                        disabled={!identifier || !password || password.length < 6 || loading}
                        loading={loading}
                        className="w-full h-[52px] rounded-[8px] text-[18px] font-semibold bg-[#95b9e4] text-white border-none active:scale-100 disabled:bg-[#c8d8ea]"
                    >
                        Login
                    </Button>
                </div>

                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="w-full text-center text-[18px] font-medium text-black py-3"
                >
                    Forgot password?
                </button>
            </form>
        </div>
    );
};

export default IdentifyStep;
