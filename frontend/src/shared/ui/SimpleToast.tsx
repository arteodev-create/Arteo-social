import React from 'react';
import { motion } from 'framer-motion';

interface SimpleToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

const SimpleToast: React.FC<SimpleToastProps> = ({ message, type }) => {
  const colors = {
    success: 'bg-zinc-900 border-zinc-800',
    error: 'bg-zinc-900 border-zinc-800',
    info: 'bg-zinc-900 border-zinc-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`${colors[type]} border text-white px-6 py-2 rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center backdrop-blur-xl pointer-events-auto min-w-[140px] tracking-tight`}
    >
      <span className="text-[13px] font-semibold text-zinc-100 whitespace-nowrap text-center">
        {message}
      </span>
    </motion.div>
  );
};

export default SimpleToast;
