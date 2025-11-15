'use client';

import { motion } from 'framer-motion';

export function AnimatedBackground() {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 2,
    duration: 15 + Math.random() * 10,
    x: Math.random() * 100,
  }));

  const notes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: i * 1.5,
    duration: 12 + Math.random() * 8,
    x: Math.random() * 100,
    emoji: ['🎵', '🎶', '♪', '♫'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-heartbreak-50 via-pink-50 to-purple-50"
        animate={{
          background: [
            'linear-gradient(to bottom right, #fef2f2, #fce7f3, #f5f3ff)',
            'linear-gradient(to bottom right, #fce7f3, #f5f3ff, #fef2f2)',
            'linear-gradient(to bottom right, #f5f3ff, #fef2f2, #fce7f3)',
            'linear-gradient(to bottom right, #fef2f2, #fce7f3, #f5f3ff)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute text-4xl opacity-20"
          initial={{
            x: `${heart.x}%`,
            y: '110%',
            rotate: 0,
            scale: 0.5,
          }}
          animate={{
            y: '-10%',
            rotate: 360,
            scale: [0.5, 1, 0.8, 1, 0.5],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          💔
        </motion.div>
      ))}

      {notes.map((note) => (
        <motion.div
          key={`note-${note.id}`}
          className="absolute text-3xl opacity-20"
          initial={{
            x: `${note.x}%`,
            y: '110%',
            rotate: -45,
          }}
          animate={{
            y: '-10%',
            rotate: 45,
            x: `${note.x + 10}%`,
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {note.emoji}
        </motion.div>
      ))}

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-heartbreak-200 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
