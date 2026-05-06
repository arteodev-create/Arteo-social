import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={checkboxId} className="custom-checkbox flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="sr-only"
          {...props}
        />
        <div className="w-4 h-4 border border-[var(--border-secondary)] rounded bg-[var(--bg-secondary)] transition-all flex items-center justify-center group-hover:border-[var(--text-primary)]">
          <Check className="w-2.5 h-2.5 text-[var(--text-primary)] hidden pointer-events-none" strokeWidth={3} />
        </div>
      </div>

      {label && (
        <span className="text-xs text-zinc-500 select-none leading-tight cursor-pointer">
          {label}
        </span>
      )}

      {error && (
        <p className="text-xs text-red-400 ml-1">{error}</p>
      )}
    </label>
  );
});

