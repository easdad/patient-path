'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllAccountInfo } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClearAccounts() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const handleClearAccounts = async () => {
    try {
      setIsClearing(true);
      setMessage('Clearing all account information...');
      
      await clearAllAccountInfo();
      
      setMessage('All account information has been cleared successfully!');
      setIsCleared(true);
    } catch (error) {
      console.error('Error clearing accounts:', error);
      setMessage('An error occurred while clearing account information. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Clear Account Information</h1>
          
          {message && (
            <div className={`p-4 mb-6 rounded-md ${isCleared ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
              {message}
            </div>
          )}
          
          <p className="mb-6 text-gray-700">
            This utility will clear all saved account information and session data from your browser.
            Use this if you're experiencing issues with login or account switching.
          </p>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleClearAccounts}
              disabled={isClearing || isCleared}
              className={`w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-orange-600 transition-colors font-medium ${
                (isClearing || isCleared) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isClearing ? 'Clearing...' : isCleared ? 'Cleared!' : 'Clear All Account Information'}
            </button>
            
            {isCleared && (
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Go to Login Page
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 