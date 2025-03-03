'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';
import { getTransportRequestsByHospitalId } from '@/lib/db/transport-requests';
import { getHospitalByUserId } from '@/lib/db/hospitals';
import { getAllAmbulanceServices } from '@/lib/db/ambulance-services';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNav from '@/components/dashboard/DashboardNav';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import TransportRequestsList from '@/components/dashboard/TransportRequestsList';
import AvailableAmbulances from '@/components/dashboard/AvailableAmbulances';
import ActiveTransports from '@/components/dashboard/ActiveTransports';
import type { TransportRequest, TransportBid } from '@/types/database.types';
import type { User, Hospital, AmbulanceService } from '@/types/database.types';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [ambulanceServices, setAmbulanceServices] = useState<AmbulanceService[]>([]);
  const [bidsReceived, setBidsReceived] = useState<TransportBid[]>([]);
  const [activeView, setActiveView] = useState<'pending' | 'active' | 'completed'>('pending');
  
  // Dashboard metrics
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeTransports, setActiveTransports] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [transportsToday, setTransportsToday] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Dashboard: Checking user...');
        setLoading(true);
        const { data: sessionData, error: sessionError } = await getCurrentUser();
        
        console.log('Dashboard: Session data:', sessionData, 'Error:', sessionError);
        
        if (sessionError || !sessionData?.user) {
          console.log('Dashboard: No user found, redirecting to login');
          router.push('/login');
          return;
        }
        
        const userData = sessionData.user;
        console.log('Dashboard: User data:', userData);
        setUser(userData);
        
        // Check if user is a hospital
        const userType = userData.user_metadata?.userType;
        const isRegistrationComplete = userData.user_metadata?.isRegistrationComplete;
        
        console.log('Dashboard: User type:', userType, 'Registration complete:', isRegistrationComplete);
        
        // If registration is not complete, redirect to registration
        if (!isRegistrationComplete) {
          console.log('Dashboard: Registration not complete, redirecting to registration');
          router.push('/registration');
          return;
        }
        
        // If user is not a hospital, redirect to ambulance dashboard
        if (userType !== 'hospital') {
          console.log('Dashboard: User is not hospital type, redirecting to ambulance dashboard');
          router.push('/ambulance-dashboard');
          return;
        }
        
        console.log('Dashboard: User is hospital type, proceeding with dashboard');
        // Fetch hospital data
        const { data: hospitalData } = await getHospitalByUserId(userData.id);
        setHospital(hospitalData);
        
        // Fetch transport requests for this hospital
        const { data: requests } = await getTransportRequestsByHospitalId(hospitalData.id);
        setTransportRequests(requests || []);
        
        // Calculate metrics
        const pending = requests?.filter(r => r.status === 'pending').length || 0;
        setPendingRequests(pending);
        
        const active = requests?.filter(r => 
          ['assigned', 'in-progress'].includes(r.status)
        ).length || 0;
        setActiveTransports(active);
        
        // Count transports today
        const today = new Date().toISOString().split('T')[0];
        const todayTransports = requests?.filter(r => 
          r.transportDate.startsWith(today)
        ).length || 0;
        setTransportsToday(todayTransports);
        
        // Calculate average response time (in minutes) from bid submission to acceptance
        // In a real app, this would be calculated from actual data
        setAvgResponseTime(12);
        
        // Fetch available ambulance services
        const { data: services } = await getAllAmbulanceServices();
        setAmbulanceServices(services || []);
        
        // Mock bids received - in a real app, fetch from API
        const mockBids: TransportBid[] = (requests || [])
          .filter(r => r.status === 'pending')
          .flatMap(request => {
            // Generate 0-3 random bids for each request
            const bidCount = Math.floor(Math.random() * 4);
            return Array(bidCount).fill(null).map((_, i) => ({
              id: `bid-${request.id}-${i}`,
              transportRequestId: request.id,
              ambulanceServiceId: services?.[Math.floor(Math.random() * services.length)]?.id || '',
              bidAmount: Math.floor(Math.random() * 1000) + 500,
              estimatedArrivalTime: '30 minutes',
              notes: 'Available immediately',
              status: 'pending',
              created_at: new Date().toISOString(),
              ambulanceService: services?.[Math.floor(Math.random() * services.length)]
            }));
          });
        setBidsReceived(mockBids);
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  // Filter requests based on active view
  const filteredRequests = transportRequests.filter(request => {
    if (activeView === 'pending') return request.status === 'pending';
    if (activeView === 'active') return ['assigned', 'in-progress'].includes(request.status);
    if (activeView === 'completed') return request.status === 'completed';
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-50">
      <DashboardHeader user={user} hospital={hospital} />
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">Hospital Dashboard</h1>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 transition-colors duration-200"
            onClick={() => router.push('/dashboard/new-request')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Transport Request
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{pendingRequests}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Transports</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeTransports}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
                <div className="flex items-center mt-2">
                  <p className="text-3xl font-bold text-orange-600">{avgResponseTime}</p>
                  <span className="text-sm text-gray-500 ml-1">min</span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Transports Today</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{transportsToday}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transport Request Management Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="border-b px-6 py-4">
            <div className="flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeView === 'pending' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveView('pending')}
              >
                Pending Requests
              </button>
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeView === 'active' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveView('active')}
              >
                Active Transports
              </button>
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeView === 'completed' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveView('completed')}
              >
                Completed Transports
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeView === 'pending' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                    Your Transport Requests
                  </h2>
                  <TransportRequestsList 
                    transportRequests={filteredRequests} 
                    hospitalId={hospital?.id} 
                  />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Bids Received
                  </h2>
                  {bidsReceived.length > 0 ? (
                    <div className="space-y-4">
                      {bidsReceived.map(bid => (
                        <div key={bid.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800">{bid.ambulanceService?.name}</p>
                              <p className="text-sm text-gray-600 mt-1">Estimated arrival: {bid.estimatedArrivalTime}</p>
                              <p className="text-sm text-gray-600">{bid.notes}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">${bid.bidAmount}</p>
                              <button className="mt-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-2 rounded-md text-sm hover:from-purple-700 hover:to-orange-600 transition-colors duration-200 shadow-sm">
                                Accept Bid
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-gray-500 font-medium">No bids received yet</p>
                      <p className="text-sm text-gray-400">Bids will appear here once EMS providers respond</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeView === 'active' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active Transports
                </h2>
                <ActiveTransports 
                  transportRequests={filteredRequests}
                  hospitalId={hospital?.id}
                />
              </div>
            )}
            
            {activeView === 'completed' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Completed Transports
                </h2>
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From/To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map(request => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{request.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.transportDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.patientName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.pickupLocation} → {request.dropoffLocation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.assignedAmbulanceService || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${request.cost || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Available Ambulance Services */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
            Available EMS Providers
          </h2>
          <AvailableAmbulances ambulanceServices={ambulanceServices} />
        </div>
      </main>
    </div>
  );
} 