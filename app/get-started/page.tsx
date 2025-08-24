'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function GetStartedPage() {
  return (
    <main className="min-h-[100dvh] flex items-center">
      <section className="container">
        <motion.div
          className="card p-6 md:p-8 text-center"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto h-16 w-16 rounded-2xl bg-brand-600/10 grid place-items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <span className="text-xl font-black text-brand-600">NT</span>
          </motion.div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight heading-gradient">Welcome to Next Todo</h1>
          <p className="mt-2 text-sm text-slate-600/90 dark:text-slate-300/80">
            A fast, beautiful, mobile‑first todo app. Stay organized anywhere.
          </p>
          <div className="mt-6 grid gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/home" className="btn btn-primary w-full py-3 text-base">
                Get Started
              </Link>
            </motion.div>
            <motion.a href="#features" className="btn btn-ghost w-full py-3 text-base" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Learn more
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          id="features"
          className="mt-6 grid gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="card p-4">
            <p className="text-sm">• Quick add, priorities, due dates</p>
          </div>
          <div className="card p-4">
            <p className="text-sm">• Works offline, data stays on device</p>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
