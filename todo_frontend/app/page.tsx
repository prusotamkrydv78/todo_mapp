'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'

export default function SplashPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.replace('/home')
        } else {
          router.replace('/auth')
        }
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [router, user, isLoading])

  return (
    <main className="min-h-[100dvh] flex items-center justify-center  ">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Modern Blobby Loader */}
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 blur-md"
            animate={{
              scale: [1, 1.2, 1],
              borderRadius: ['50%', '40%', '60%', '50%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* App Name */}
        <motion.h1
          className="mt-6 text-2xl font-semibold  tracking-widest"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          style={{ textShadow: '0 0 12px rgba(0,0,0,0.4)' }}
        >
          Todo App
        </motion.h1>

        {/* Credit */}
        <motion.p
          className="mt-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Crafted by Prusotam ✨
        </motion.p>
      </motion.div>
    </main>
  )
}
