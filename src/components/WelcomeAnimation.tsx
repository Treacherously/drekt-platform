'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [showText, setShowText] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Start text animation after a brief delay
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);

    // Complete animation after 4 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Prevent hydration mismatch by returning static content until client-side mount
  if (!hasMounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      </div>
    );
  }

  return (
    <motion.div
      suppressHydrationWarning
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Glassmorphism background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        initial={{ opacity: 1, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 0.95, backdropFilter: 'blur(20px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(40px)' }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Welcome text with blur animation */}
      {showText && (
        <motion.div
          className="relative z-10 max-w-4xl px-8 text-center"
          initial={{ opacity: 0, filter: 'blur(20px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(20px)', y: -20 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-wide leading-tight">
            Searching suppliers, distributors, or manufacturers has never been{' '}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              so easy
            </span>{' '}
            before
          </h1>
        </motion.div>
      )}

      {/* Subtle loading indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white/50 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
