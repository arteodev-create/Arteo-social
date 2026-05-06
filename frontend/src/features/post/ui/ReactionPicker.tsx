import React from 'react';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@shared/ui';

interface ReactionPickerProps {
    children: React.ReactNode;
    onSelect: (emoji: string) => void;
}

const REACTIONS = ['heart', 'joy', 'wow', 'fire', 'boost', 'perfect'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ children, onSelect }) => {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={10}
                className="flex items-center gap-1.5 p-1.5 rounded-[8px] border border-[var(--border-primary)] shadow-none bg-[var(--bg-primary)]  animate-platinum-in z-[1001]"
                onClick={(e) => e.stopPropagation()}
            >
                {REACTIONS.map((reaction, idx) => (
                    <DropdownMenuItem
                        key={reaction}
                        asChild
                        onSelect={() => onSelect(reaction)}
                        className="p-0 focus:bg-transparent bg-transparent outline-none border-none"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: { delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }
                            }}
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[11px] font-bold px-3 h-10 flex items-center justify-center rounded-[8px] active:bg-[var(--bg-secondary)] transition-colors cursor-pointer outline-none border-none"
                        >
                            {reaction}
                        </motion.button>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
