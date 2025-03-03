'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';
import AmbulanceIcon from '@/components/AmbulanceIcon'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
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
          router.replace('/ambulance-dashboard');
        } else {
          console.log('Redirecting to hospital dashboard');
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

      {/* Logo centered above everything */}
      <div className="w-full flex justify-center mt-12 mb-0">
        <div className="w-48 h-48 flex items-center justify-center">
          <AmbulanceIcon className="text-[#00CED1]" size={192} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center p-4 pt-0 gap-8">
        {/* Welcome message and user type cards - First on mobile, Left on desktop */}
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Patient PATH</h2>
            <p className="text-gray-600 mb-4">
              Streamlining patient transport coordination between healthcare facilities.
            </p>
          </div>

          {/* User Type Cards */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-base">For Hospitals</h3>
                  <p className="text-gray-600 text-sm">Easily request patient transports and track their status.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-md">
                  <AmbulanceIcon className="h-5 w-5 text-[#00CED1]" />
                </div>
                <div>
                  <h3 className="font-medium text-base">For Ambulance Services</h3>
                  <p className="text-gray-600 text-sm">Find transport requests and manage your fleet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login form - Second on mobile, Right on desktop */}
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Log In</h2>
            <p className="text-gray-600">
              Access your Patient PATH account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
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
                  Forgot?
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

          <div className="text-center mt-4">
            <p className="text-gray-600 mb-2">
              Don't have an account?
            </p>
            <Link 
              href="/register" 
              className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Register New Account
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
} 