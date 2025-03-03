'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { getAmbulanceServiceByUserId } from '@/lib/db/ambulance-services';
import { getAssignmentsByAmbulanceServiceId } from '@/lib/db/transport-assignments';
import AmbulanceDashboardHeader from '@/components/ambulance-dashboard/AmbulanceDashboardHeader';
import AmbulanceDashboardNav from '@/components/ambulance-dashboard/AmbulanceDashboardNav';
import type { TransportAssignment, User, AmbulanceService } from '@/types/database.types';

export default function TransportHistory() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ambulanceService, setAmbulanceService] = useState<AmbulanceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [transportHistory, setTransportHistory] = useState<TransportAssignment[]>([]);
  const [dateRange, setDateRange] = useState('last30');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: currentUser, error } = await getCurrentUser();
        
        if (error || !currentUser) {
          console.log('No user found or error:', error);
          router.push('/login');
          return;
        }
        
        console.log('Raw currentUser data:', JSON.stringify(currentUser, null, 2));
        
        // Extract user from the nested structure
        const userData = currentUser.user;
        console.log('Extracted userData:', JSON.stringify(userData, null, 2));
        
        setUser(userData);
        
        if (userData?.user_metadata?.userType === 'ambulance') {
          const { data: ambulanceData } = await getAmbulanceServiceByUserId(userData.id);
          setAmbulanceService(ambulanceData);
          
          if (ambulanceData) {
            const { data: assignments, error: assignmentsError } = await getAssignmentsByAmbulanceServiceId(ambulanceData.id);
            
            if (assignmentsError) {
              console.error('Error fetching assignments:', assignmentsError);
              return;
            }
            
            // Add mock vehicle IDs for demonstration
            const assignmentsWithVehicles = assignments?.map(assignment => ({
              ...assignment,
              vehicleId: Math.floor(Math.random() * 10) + 1, // Random vehicle ID between 1-10
              transportRequest: assignment.transport_requests // Map from the joined table
            })) || [];
            
            // Filter to only include completed or cancelled transports
            const history = assignmentsWithVehicles.filter(a => 
              a.status === 'completed' || a.status === 'cancelled'
            );
            
            setTransportHistory(history);
          }
        } else {
          // User is not an ambulance service
          console.log(`User type is ${userData?.user_metadata?.userType}, expected 'ambulance'`);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error loading transport history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const getStatusBadge = (status: TransportAssignment['status']) => {
    const statusConfig = {
      completed: { 
        label: 'COMPLETED', 
        classes: 'bg-green-100 text-green-800 border border-green-200' 
      },
      cancelled: { 
        label: 'CANCELLED', 
        classes: 'bg-red-100 text-red-800 border border-red-200' 
      },
    };

    const config = statusConfig[status] || { label: status.toUpperCase(), classes: 'bg-gray-100 text-gray-800 border border-gray-200' };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-md shadow-sm ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getFilteredHistory = () => {
    let filtered = [...transportHistory];
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      if (dateRange === 'last7') {
        startDate.setDate(today.getDate() - 7);
      } else if (dateRange === 'last30') {
        startDate.setDate(today.getDate() - 30);
      } else if (dateRange === 'last90') {
        startDate.setDate(today.getDate() - 90);
      }
      
      filtered = filtered.filter(transport => {
        const transportDate = new Date(transport.created_at);
        return transportDate >= startDate && transportDate <= today;
      });
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transport => 
        transport.transportRequest?.patientName?.toLowerCase().includes(term) ||
        transport.transportRequest?.pickupAddress?.toLowerCase().includes(term) ||
        transport.transportRequest?.dropoffAddress?.toLowerCase().includes(term) ||
        transport.transportRequest?.transportType?.toLowerCase().includes(term) ||
        transport.vehicleId?.toString().includes(term)
      );
    }
    
    // Sort by date, most recent first
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const filteredHistory = getFilteredHistory();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('User signed out');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-600 border-r-orange-500 border-b-purple-600 border-l-orange-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading transport history...</p>
        </div>
      </div>
    );
  }

  // Show error message if user is not an ambulance service
  if (user && user.user_metadata?.userType !== 'ambulance') {
    console.log('Access denied - User type is not ambulance:', user.user_metadata?.userType);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-50">
        <AmbulanceDashboardHeader user={user} ambulanceService={null} />
        <AmbulanceDashboardNav />
        
        <main className="container mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-2">This page is only available to ambulance service users. Please use the appropriate dashboard for your account type.</p>
            <p className="text-gray-500 mb-6 text-sm">Current account type: {user.user_metadata?.userType || 'Unknown'}</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
              >
                Go to Hospital Dashboard
              </button>
              <button 
                onClick={handleSignOut}
                className="text-purple-600 hover:text-purple-800 transition duration-300 ease-in-out"
              >
                Sign out and switch accounts
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-50">
      <AmbulanceDashboardHeader user={user} ambulanceService={ambulanceService} />
      <AmbulanceDashboardNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transport History</h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
              {searchTerm && ' matching your search'}
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transports..."
                className="px-4 py-2 pl-10 border rounded-md w-64 focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              className="px-4 py-2 border rounded-md bg-white focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-600 to-orange-500 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Transport Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    From / To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.transportRequest?.patientName}</div>
                        <div className="text-sm text-gray-500">DOB: {assignment.transportRequest?.patientDob ? new Date(assignment.transportRequest.patientDob).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${assignment.transportRequest?.transportType === 'emergency' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {assignment.transportRequest?.transportType === 'emergency' ? 'Emergency' : 'Non-Emergency'}
                        </div>
                        {assignment.transportRequest?.specialRequirements && (
                          <div className="text-sm text-gray-500">{assignment.transportRequest.specialRequirements}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(assignment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          From: {assignment.transportRequest?.pickupAddress}, {assignment.transportRequest?.pickupCity}
                        </div>
                        <div className="text-sm text-gray-500">
                          To: {assignment.transportRequest?.dropoffAddress}, {assignment.transportRequest?.dropoffCity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Vehicle #{assignment.vehicleId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(assignment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-3 py-1 rounded-md text-sm transition duration-300 ease-in-out">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium mb-1">No transport history found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 