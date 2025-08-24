'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.replace('/get-started'), 3000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <main className="min-h-[100dvh] flex items-center justify-center">
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="splash-ring"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.div
          className="splash-logo"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
        >
          NT
        </motion.div>
        <motion.p
          className="mt-4 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Next Todo
        </motion.p>
      </motion.div>
    </main>
  )
}
