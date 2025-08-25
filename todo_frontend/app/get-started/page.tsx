'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Shield, Smartphone, Sparkles, ArrowRight } from 'lucide-react'

export default function GetStartedPage() {
  return (
    <main className="min-h-[100dvh] flex items-center  ">
      <section className="container relative">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <motion.div
          className="p-6 md:p-10 text-center backdrop-blur  "
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto h-16 w-16 rounded-2xl  grid place-items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <span className="text-xl font-black text-brand-600">Todo</span>
          </motion.div>
          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight heading-gradient">Welcome to Next Todo</h1>
          <p className="mt-2 text-sm md:text-base text-slate-600/90 dark:text-slate-300/80 max-w-2xl mx-auto">
            A fast, beautiful, mobile‑first todo app with silky animations and local‑first storage. Stay organized anywhere.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
              <Link href="/home" className="btn btn-primary w-full py-3 text-base">
                Start using the app
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
              <Link href="/learn-more" className="btn btn-ghost w-full py-3 text-base">
                Learn more
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          id="features"
          className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <FeatureCard icon={<Zap className="h-5 w-5 text-brand-600" />} title="Fast and fluid" desc="Snappy interactions and micro‑animations powered by Framer Motion." />
          <FeatureCard icon={<Smartphone className="h-5 w-5 text-brand-600" />} title="Mobile‑first" desc="Responsive design that feels right at home on phones and desktops." />
          <FeatureCard icon={<Shield className="h-5 w-5 text-brand-600" />} title="Private by default" desc="Local‑first data with zero tracking. Your tasks stay on your device." />
          <FeatureCard icon={<Sparkles className="h-5 w-5 text-brand-600" />} title="Polished UI" desc="Clean visuals, soft shadows, and glassy surfaces for a modern feel." />
        </motion.div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      className="p-4  backdrop-blur"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="h-9 w-9 rounded-xl grid place-items-center">
        {icon}
      </div>
      <h4 className="mt-3 font-semibold">{title}</h4>
      <p className="text-sm text-slate-600/90 dark:text-slate-300/80 mt-1">{desc}</p>
    </motion.div>
  )
}
