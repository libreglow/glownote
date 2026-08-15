'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-[#0a0a0a] dark:backdrop-blur-none"
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-75 bg-white/30 blur-[80px] rotate-[-15deg] hidden dark:block"
              style={{ borderRadius: '50%' }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_80%)] hidden dark:block" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              opacity: { duration: 0.4 },
            }}
            className="relative w-full max-w-135 backdrop-blur-2xl rounded-[32px] p-5 sm:p-6 shadow-2xl z-50 my-auto
                       bg-white border-[6px] sm:border-12 border-[#F2F2F2]
                       dark:bg-[#131313]/80 dark:border-[#232323]"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
