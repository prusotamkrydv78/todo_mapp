import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiEndpoints } from '@/lib/api-config';

type FormData = {
  name: string;
  email: string;
  username: string;
  password: string;
};

const RegisterSteps = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(apiEndpoints.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Store the token
        localStorage.setItem('token', data.token);
        // Redirect to home page
        router.push('/home');
      } else {
        // Handle error
        const error = await response.json();
        alert(error.message || 'Registration failed');
      }
    } catch (error) {
      alert('Network error occurred');
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
            <h2 className="text-2xl font-bold mb-6">What's your name?</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
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
            <h2 className="text-2xl font-bold mb-6">What's your email?</h2>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setStep(3)}
              disabled={!formData.email}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full p-3 text-gray-600"
            >
              Back
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Choose a username</h2>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateFormData('username', e.target.value)}
              placeholder="Enter your username"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setStep(4)}
              disabled={!formData.username}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Continue
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full p-3 text-gray-600"
            >
              Back
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Create a password</h2>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSubmit}
              disabled={!formData.password}
              className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:opacity-50"
            >
              Complete Registration
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full p-3 text-gray-600"
            >
              Back
            </button>
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
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 w-[23%] rounded-full ${
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
};

export default RegisterSteps;
