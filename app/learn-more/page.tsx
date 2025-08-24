'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LearnMorePage() {
  return (
    <main className="container py-8 md:py-12">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 md:mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight heading-gradient">
          Learn more
        </h1>
        <p className="mt-2 text-slate-600/90 dark:text-slate-300/80 max-w-2xl">
          Get to know the creator, the vision behind this app, and what's coming next.
        </p>
      </motion.header>

      {/* Author */}
      <motion.section
        className=" p-5 md:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-14 w-14 rounded-2xl  grid place-items-center shrink-0">
            <span className="text-lg font-black text-brand-600">PY</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Prusotam Yadav</h2>
            <p className="text-slate-600/90 dark:text-slate-300/80">
              Full‑stack developer • Crafting fast, polished, mobile‑first web apps.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="badge">TypeScript</span>
              <span className="badge">React/Next.js</span>
              <span className="badge">Node.js</span>
              <span className="badge">Tailwind CSS</span>
              <span className="badge">Zustand</span>
              <span className="badge">Capacitor</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* About the app */}
      <motion.section
        className="mt-5 grid gap-4 md:grid-cols-2"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
          }
        }}
      >
        <motion.div
          className=" p-5"
          variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        >
          <h3 className="font-semibold mb-2">What is this?</h3>
          <p className="text-sm text-slate-600/90 dark:text-slate-300/80">
            A clean, local‑first todo app focused on speed and delightful micro‑interactions.
            It works great on mobile and desktop, and can be packaged as a native app with Capacitor.
          </p>
        </motion.div>

        <motion.div
          className=" p-5"
          variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        >
          <h3 className="font-semibold mb-2">Key features</h3>
          <ul className="text-sm list-disc ps-5 space-y-1 text-slate-600/90 dark:text-slate-300/80">
            <li>Quick add, priorities (Low/Medium/High), and due dates</li>
            <li>Filters, search, and bulk complete/uncheck</li>
            <li>Smooth add/remove/reorder animations powered by Framer Motion</li>
            <li>Light/Dark mode with a theme toggle</li>
            <li>Local‑first persistence via Zustand</li>
          </ul>
        </motion.div>

        <motion.div
          className=" p-5"
          variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        >
          <h3 className="font-semibold mb-2">Tech stack</h3>
          <ul className="text-sm list-disc ps-5 space-y-1 text-slate-600/90 dark:text-slate-300/80">
            <li>Next.js 14 (App Router) + TypeScript</li>
            <li>Tailwind CSS for styling</li>
            <li>Zustand for state management</li>
            <li>Framer Motion for animations</li>
            <li>Capacitor for native builds (Android/iOS)</li>
          </ul>
        </motion.div>

        <motion.div
          className=" p-5"
          variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}
        >
          <h3 className="font-semibold mb-2">Privacy & data</h3>
          <p className="text-sm text-slate-600/90 dark:text-slate-300/80">
            Your data stays on your device. No servers, no accounts, no tracking. You can clear all
            data anytime from the Home page using "Clear completed" or by resetting local storage.
          </p>
        </motion.div>
      </motion.section>

      {/* Roadmap */}
      <motion.section
        className="mt-5  p-5"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35 }}
      >
        <h3 className="font-semibold mb-2">Roadmap</h3>
        <ul className="text-sm list-disc ps-5 space-y-1 text-slate-600/90 dark:text-slate-300/80">
          <li>Subtasks and notes</li>
          <li>Reminders and notifications</li>
          <li>Drag and drop reordering</li>
          <li>Optional cloud sync</li>
        </ul>
      </motion.section>

      {/* Contact / Links */}
      <motion.section
        className="mt-5 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Link href="/home" className="btn btn-primary">Go to app</Link>
        <Link href="/get-started" className="btn btn-ghost">Get started</Link>
      </motion.section>
    </main>
  )
}
