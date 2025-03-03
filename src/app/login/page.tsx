'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', email);
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
      
      if (data) {
        console.log('Login successful, user data:', data.user);
        // Get the user type and registration status from the user metadata
        const userType = data.user?.user_metadata?.userType || 'hospital';
        const isRegistrationComplete = data.user?.user_metadata?.isRegistrationComplete;
        
        console.log('User type:', userType, 'Registration complete:', isRegistrationComplete);
        
        // If registration is not complete, redirect to registration page
        if (!isRegistrationComplete) {
          console.log('Registration not complete, redirecting to /registration');
          router.push('/registration');
          return;
        }
        
        // Redirect to the appropriate dashboard based on user type
        if (userType === 'ambulance') {
          console.log('Redirecting to ambulance dashboard');
          // Use replace instead of push for more reliable navigation
          router.replace('/ambulance-dashboard');
        } else {
          console.log('Redirecting to hospital dashboard');
          // Use replace instead of push for more reliable navigation
          router.replace('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-600">
              Log in to your Patient PATH account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-orange-600 transition-colors font-medium ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-500 font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
} 