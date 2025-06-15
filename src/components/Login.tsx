'use client';

import React, { useState } from 'react';
import Signup from './SignUp';
import { useNavigation } from '@/hooks/useNavigation';
import { api } from '@/lib/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  const { navigateTo } = useNavigation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setError(null);
      const { data } = await api.post('/users/login', { email, password });
      localStorage.setItem('token', data.token);
      navigateTo('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Server unavailable. Try again later.';
      setError(msg);
    }
  };

  const handleClose = () => setIsOpen(false);
  const toggleForm = () => setShowSignup(!showSignup);

  if (!isOpen) return null;
  if (showSignup) {
    return <Signup onClose={handleClose} onSwitchToLogin={toggleForm} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="p-8">
          {/* cabeçalho */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to FinSync!
            </h2>
            <button
              aria-label="Close"
              onClick={handleClose}
              className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* mensagem de erro */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cursor-pointer block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm 
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                          transition-all duration-200 placeholder:text-gray-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cursor-pointer block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm 
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                          transition-all duration-200 placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="cursor-pointer h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white 
                        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                        focus:ring-offset-2 transition-colors duration-200 shadow-sm"
            >
              Sign in
            </button>
          </form>

          {/* link para cadastro */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={toggleForm}
              className="cursor-pointer font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;