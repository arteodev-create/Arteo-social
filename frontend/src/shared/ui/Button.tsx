import React, { useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useSpring, useTransform } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@shared/lib';
import { Slot } from '@radix-ui/react-slot';

/**
 * Button Variants (Arteo Platinum v14.1)
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-30 disabled:pointer-events-none select-none relative overflow-hidden active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--text-primary)] !text-[var(--bg-primary)] border border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:!text-[var(--bg-primary)] transition-all duration-200',
        secondary: 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
        outline: 'border border-[var(--border-primary)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
        ghost: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
        link: 'text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-12 px-6 text-[14px]',
        lg: 'h-16 px-10 text-[15px]',
        icon: 'h-10 w-10',
      },
      isMagnetic: {
        true: 'relative',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      isMagnetic: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  magneticStrength?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isMagnetic, asChild = false, loading, magneticStrength = 15, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const magneticRef = useRef<HTMLButtonElement>(null);
    
    // Magnetic Logic
    const mouseX = useSpring(0, { damping: 15, stiffness: 150 });
    const mouseY = useSpring(0, { damping: 15, stiffness: 150 });

    const tx = useTransform(mouseX, [-0.5, 0.5], [-magneticStrength, magneticStrength]);
    const ty = useTransform(mouseY, [-0.5, 0.5], [-magneticStrength, magneticStrength]);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isMagnetic || !magneticRef.current) return;
      const rect = magneticRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

  const content = (
      <>
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        <span className="relative z-10 flex items-center justify-center gap-2 text-inherit">
           {!loading && children}
        </span>
      </>
    );

    if (isMagnetic) {
      return (
        <motion.button
          style={{ x: tx, y: ty }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={magneticRef}
          className={cn(buttonVariants({ variant, size, isMagnetic, className }))}
          disabled={loading || props.disabled}
          {...(props as any)}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {content}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
