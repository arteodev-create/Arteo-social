import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Technical Utility: cn (Class Name)
 * Merges tailwind classes intelligently using clsx and tailwind-merge.
 * Prevents class collision and allows for professional variant management.
 * @version ADS v1.0
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

