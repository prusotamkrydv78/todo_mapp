'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

type FormData = {
  identifier: string; // Can be email or username
  password: string;
};

export default function LoginSteps() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const updateFormData = (field: keyof FormData, value: string) => {
    setError('');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token
      localStorage.setItem('token', data.token);
      
      // Update auth context
      await checkAuthStatus();

      // Redirect to home
      router.push('/home');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Welcome back!</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Email or Username</label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => updateFormData('identifier', e.target.value)}
                placeholder="Enter your email or username"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.identifier}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Enter your password</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!formData.password}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Login
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full p-3 text-gray-600"
            >
              Back
            </button>
            <div className="text-center">
              <button className="text-sm text-blue-500 hover:underline">
                Forgot password?
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="mb-8 flex justify-between">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 w-[48%] rounded-full ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}
