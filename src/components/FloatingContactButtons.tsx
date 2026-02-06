import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export const FloatingContactButtons: React.FC = () => {
  const lineId = import.meta.env.VITE_LINE_ID || 'orzmashi';
  const lineUrl = `https://line.me/ti/p/${lineId}`;

  const buttonVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
      {/* Line Button */}
      <motion.a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
        style={{ backgroundColor: '#00B900' }}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        aria-label="Contact via Line"
      >
        <MessageCircle size={28} className="text-white" strokeWidth={2.5} />
      </motion.a>
    </div>
  );
};
