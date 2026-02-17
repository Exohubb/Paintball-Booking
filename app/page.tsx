'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to captcha page after animation
    const timer = setTimeout(() => {
      router.push('/auth/captcha');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-xploit-primary via-neon-purple to-ecell-primary bg-clip-text text-transparent"
          animate={{ 
            backgroundPosition: ['0%', '100%', '0%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          PAINTBALL
        </motion.h1>
        
        <motion.h2
          className="text-3xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xploit-primary">XPLOIT</span>
          {' VS '}
          <span className="text-ecell-primary">ECELL</span>
        </motion.h2>

        <motion.p
          className="text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Championship 2026
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-xploit-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-ecell-primary rounded-full animate-pulse delay-200"></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
