'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User, AmbulanceService } from '@/types/database.types';

interface AmbulanceDashboardHeaderProps {
  user: User | null;
  ambulanceService: AmbulanceService | null;
}

export default function AmbulanceDashboardHeader({ user, ambulanceService }: AmbulanceDashboardHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  return (
    <header className="bg-gradient-to-r from-purple-600 to-orange-500 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/ambulance-dashboard" className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 20H5v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-9l2.1-4.63A2 2 0 016 6h12a2 2 0 011.9 1.37L22 12v9a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1zM7.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 14h14v2H5v-2zm0-4.67L6.5 8h11l1.5 1.33V12H5v-2.67z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold text-white">PATIENT PATH</span>
            <p className="text-xs text-white opacity-80">Patient Transport Hub</p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1 text-sm text-white bg-white bg-opacity-20 px-3 py-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="flex items-center space-x-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 hover:bg-opacity-30 transition-colors duration-200"
            >
              <div className="bg-white text-purple-600 rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold">{ambulanceService?.name?.charAt(0) || user?.organizationName?.charAt(0) || 'A'}</span>
              </div>
              <span className="hidden md:inline-block font-medium text-white">
                {ambulanceService?.name || user?.organizationName || 'Ambulance Service'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10 border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-orange-50 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <Link href="/ambulance-profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    Profile Settings
                  </Link>
                  
                  <Link href="/ambulance-dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Account Settings
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 5a1 1 0 00-1-1H8a1 1 0 00-1 1v8a1 1 0 001 1h3a1 1 0 001-1V8z" clipRule="evenodd" />
                      <path d="M7 0a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V1a1 1 0 00-1-1H7z" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 