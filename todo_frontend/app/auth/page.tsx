'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthChoice() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6  ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to TodoMapp
            </h1>
          </motion.div>
          <p className="text-gray-600 text-lg">
            Your personal task management companion
          </p>
        </div>

        {/* Auth Options */}
        <div className="space-y-4 mt-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/auth/login">
              <button className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Sign In</span>
                <span className="text-sm text-gray-500">→</span>
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/auth/register">
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Create Account</span>
                <span>→</span>
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 space-y-6"
        >
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
            Why TodoMapp?
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">✓</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Smart Task Management</h3>
                  <p className="text-sm text-gray-500">Organize tasks with AI assistance</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">⚡</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Cross-Platform Sync</h3>
                  <p className="text-sm text-gray-500">Access your tasks anywhere</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600">💫</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">AI Chat Assistant</h3>
                  <p className="text-sm text-gray-500">Get help when you need it</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
