import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@shared/lib';

const inputVariants = cva(
  'flex h-11 w-full rounded-[8px] border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3.5 py-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-zinc-500 focus-visible:outline-none focus:border-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      hasError: {
        true: 'border-red-500',
        false: '',
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-500 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[var(--text-primary)] transition-colors">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ hasError, className }),
              icon && "pl-11"
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-zinc-400 ml-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
