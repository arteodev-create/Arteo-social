import React, { useState } from 'react';
import { Check, WarningCircle, Eye, EyeSlash } from '@phosphor-icons/react';
import { LoadingSpinner } from '@shared/ui';

interface MinimalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string;
    isValid?: boolean;
    isError?: string | boolean | null;
    isLoading?: boolean;
    hint?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    forceLight?: boolean;
    inputClassName?: string;
}

/**
 * Minimalist Input (Arteo Platinum v14.1)
 */
const MinimalInput: React.FC<MinimalInputProps> = (props) => {
    const { label, isValid, isError, isLoading, prefix, suffix, hint, className, type, forceLight, inputClassName, ...inputProps } = props;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : (type || 'text');

    return (
        <div className={`w-full ${className || ''}`}>
            <div className="relative">
                {prefix && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        {prefix}
                    </div>
                )}
                
                <input
                    {...inputProps}
                    type={inputType}
                    spellCheck={false}
                    className={`w-full h-[60px] rounded-[8px] outline-none text-[17px] font-medium tracking-[-0.01em]
                        ${prefix ? 'pl-16 pr-10' : 'px-10'}
                        ${forceLight 
                            ? 'bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:border-zinc-400' 
                            : 'bg-white border border-zinc-200 text-black placeholder:text-zinc-400 focus:border-zinc-400'}
                        ${isError ? '!border-red-500/50' : ''}
                        ${props.inputClassName || ''}
                    `}
                />
                
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {isError && (
                        <WarningCircle size={18} weight="bold" className="text-red-500/80" />
                    )}

                    {isPassword && props.value && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-zinc-400 p-1"
                        >
                            {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
                        </button>
                    )}

                    {!isPassword && (isLoading || isValid || suffix) && (
                        <div className="flex items-center gap-2">
                            {isLoading ? <LoadingSpinner size="sm" />
                                : isValid ? <Check size={18} weight="bold" className="text-black" />
                                : suffix || null}
                        </div>
                    )}
                </div>
            </div>
            
            {isError && typeof isError === 'string' && (
                <p className="px-6 mt-2 text-[11px] text-red-500/80 font-medium leading-tight">{isError}</p>
            )}
        </div>
    );
};

export default MinimalInput;

