import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { User } from 'lucide-react';
import { cn } from '@shared/lib';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden transition-all duration-300 select-none outline-none',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-24 w-24',
      },
      shape: {
        circle: 'rounded-[8px]',
        ai: 'rounded-[8px] border-white/10',
      }
    },
    defaultVariants: {
      size: 'md',
      shape: 'ai',
    },
  }
);

interface AvatarProps 
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    Omit<VariantProps<typeof avatarVariants>, 'size'> {
  src?: string | null;
  fallback?: string;
  username?: string;
  seed?: string;
  size?: VariantProps<typeof avatarVariants>['size'] | number;
  showBorder?: boolean;
  loading?: 'eager' | 'lazy';
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, src, fallback: _fallback, username: _username, seed: _seed, showBorder = false, loading, style, ...props }, ref) => {
  const isCustomSize = typeof size === 'number';
  const sizeToken = isCustomSize ? 'custom' : (size || 'md');
  const customSizeStyle = isCustomSize ? { width: size, height: size } : {};

  return (
    <div className="relative inline-flex flex-shrink-0 outline-none">
      <AvatarPrimitive.Root
        ref={ref}
        style={{ ...style, ...customSizeStyle }}
        className={cn(avatarVariants({ size: sizeToken as any, shape: shape || 'circle', className }), 
          showBorder && 'border border-[var(--border-primary)]'
        )}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src || undefined}
          className="aspect-square h-full w-full object-cover transition-opacity duration-300"
          loading={loading}
        />

        <AvatarPrimitive.Fallback
          className="flex h-full w-full items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-muted)]"
          delayMs={0}
        >
          <User className="h-1/2 w-1/2" strokeWidth={2.5} />
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    </div>
  );
});

Avatar.displayName = 'Avatar';

export { Avatar };
