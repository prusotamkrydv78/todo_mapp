'use client';

import { Mail } from 'lucide-react';

export default function VerificationPending() {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div
        className="text-center max-w-md mx-auto animate-fadeIn"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
          <p className="text-gray-600">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or request a new verification link.
          </p>
          <button
            onClick={() => {
              // Add resend verification email logic here
            }}
            className="text-blue-500 underline"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </div>
  )
}
