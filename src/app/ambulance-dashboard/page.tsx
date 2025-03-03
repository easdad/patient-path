'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';
import { getAmbulanceServiceByUserId } from '@/lib/db/ambulance-services';
import { getBidsByAmbulanceServiceId } from '@/lib/db/transport-bids';
import { getAssignmentsByAmbulanceServiceId } from '@/lib/db/transport-assignments';
import { getPendingTransportRequests } from '@/lib/db/transport-requests';
import AmbulanceDashboardHeader from '@/components/ambulance-dashboard/AmbulanceDashboardHeader';
import AmbulanceDashboardNav from '@/components/ambulance-dashboard/AmbulanceDashboardNav';
import AvailableRequests from '@/components/ambulance-dashboard/AvailableRequests';
import CurrentAssignments from '@/components/ambulance-dashboard/CurrentAssignments';
import FleetManagement from '@/components/ambulance-dashboard/FleetManagement';
import BiddingHistory from '@/components/ambulance-dashboard/BiddingHistory';
import type { TransportRequest, TransportBid, TransportAssignment, User, AmbulanceService, Vehicle } from '@/types/database.types';

export default function AmbulanceDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ambulanceService, setAmbulanceService] = useState<AmbulanceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<TransportRequest[]>([]);
  const [bids, setBids] = useState<TransportBid[]>([]);
  const [assignments, setAssignments] = useState<TransportAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'fleet' | 'bids' | 'analytics'>('dispatch');
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  
  // Dashboard metrics
  const [pendingBids, setPendingBids] = useState(0);
  const [activeAssignments, setActiveAssignments] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Ambulance Dashboard: Checking user...');
        setLoading(true);
        const { data: sessionData, error: sessionError } = await getCurrentUser();
        
        console.log('Ambulance Dashboard: Session data:', sessionData, 'Error:', sessionError);
        
        if (sessionError || !sessionData?.user) {
          console.log('Ambulance Dashboard: No user found, redirecting to login');
          router.push('/login');
          return;
        }
        
        const userData = sessionData.user;
        console.log('Ambulance Dashboard: User data:', userData);
        setUser(userData);
        
        // Check if user is an ambulance service
        const userType = userData.user_metadata?.userType;
        const isRegistrationComplete = userData.user_metadata?.isRegistrationComplete;
        
        console.log('Ambulance Dashboard: User type:', userType, 'Registration complete:', isRegistrationComplete);
        
        // If registration is not complete, redirect to registration
        if (!isRegistrationComplete) {
          console.log('Ambulance Dashboard: Registration not complete, redirecting to registration');
          router.push('/registration');
          return;
        }
        
        // If user is not an ambulance service, redirect to hospital dashboard
        if (userType !== 'ambulance') {
          console.log('Ambulance Dashboard: User is not ambulance type, redirecting to hospital dashboard');
          router.push('/dashboard');
          return;
        }
        
        console.log('Ambulance Dashboard: User is ambulance type, proceeding with dashboard');
        // Fetch ambulance service data
        const { data: ambulanceData } = await getAmbulanceServiceByUserId(userData.id);
        setAmbulanceService(ambulanceData);
        
        // Fetch pending transport requests, bids, and assignments
        const { data: pendingRequestsData } = await getPendingTransportRequests();
        setPendingRequests(pendingRequestsData || []);
        
        if (ambulanceData) {
          const { data: bidsData } = await getBidsByAmbulanceServiceId(ambulanceData.id);
          setBids(bidsData || []);
          
          const { data: assignmentsData } = await getAssignmentsByAmbulanceServiceId(ambulanceData.id);
          setAssignments(assignmentsData || []);
          
          // Mock fleet data
          const mockFleet = [
            {
              id: 'vehicle-1',
              ambulanceServiceId: ambulanceData.id,
              vehicleType: 'Basic Life Support',
              vehicleNumber: 'AMB-101',
              licensePlate: 'EMS-1234',
              status: 'available',
              currentLocation: { lat: 40.7128, lng: -74.0060 },
              lastMaintenance: '2023-04-15',
              crew: ['John Smith', 'Maria Rodriguez'],
              created_at: '2023-01-05T12:00:00Z'
            },
            {
              id: 'vehicle-2',
              ambulanceServiceId: ambulanceData.id,
              vehicleType: 'Advanced Life Support',
              vehicleNumber: 'AMB-102',
              licensePlate: 'EMS-5678',
              status: 'assigned',
              currentLocation: { lat: 40.7138, lng: -74.0070 },
              lastMaintenance: '2023-05-20',
              crew: ['Robert Johnson', 'Emily Davis'],
              created_at: '2023-01-05T12:00:00Z'
            },
            {
              id: 'vehicle-3',
              ambulanceServiceId: ambulanceData.id,
              vehicleType: 'Critical Care',
              vehicleNumber: 'AMB-103',
              licensePlate: 'EMS-9012',
              status: 'maintenance',
              currentLocation: { lat: 40.7118, lng: -74.0050 },
              lastMaintenance: '2023-06-10',
              crew: [],
              created_at: '2023-01-05T12:00:00Z'
            }
          ];
          setFleet(mockFleet);
          
          // Calculate dashboard metrics
          const pendingBidsCount = (bidsData || []).filter(bid => bid.status === 'pending').length;
          setPendingBids(pendingBidsCount);
          
          const activeAssignmentsCount = (assignmentsData || []).filter(a => ['assigned', 'in-progress'].includes(a.status)).length;
          setActiveAssignments(activeAssignmentsCount);
          
          // Calculate completed transports today
          const today = new Date().toISOString().split('T')[0];
          const completedTodayCount = (assignmentsData || []).filter(a => {
            return a.status === 'completed' && a.endTime?.startsWith(today);
          }).length;
          setCompletedToday(completedTodayCount);
          
          // Calculate estimated revenue (in a real app, this would come from actual payment data)
          const revenueCalc = (assignmentsData || [])
            .filter(a => a.status === 'completed')
            .reduce((total, a) => total + (a.finalAmount || 0), 0);
          setRevenue(revenueCalc);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking user:', error);
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-50">
      <AmbulanceDashboardHeader user={user} ambulanceService={ambulanceService} />
      <AmbulanceDashboardNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">EMS Provider Dashboard</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-600">Online - Ready for Dispatch</span>
          </div>
        </div>
        
        {/* Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Bids</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{pendingBids}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Assignments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{activeAssignments}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{completedToday}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">${revenue}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="border-b px-6 py-4">
            <div className="flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'dispatch' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('dispatch')}
              >
                Dispatch Center
              </button>
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'fleet' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('fleet')}
              >
                Fleet Management
              </button>
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'bids' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('bids')}
              >
                Bidding History
              </button>
              <button 
                className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'analytics' 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dispatch' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                    Available Transport Requests
                  </h2>
                  <AvailableRequests 
                    pendingRequests={pendingRequests} 
                    ambulanceServiceId={ambulanceService?.id} 
                  />
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Current Assignments
                  </h2>
                  <CurrentAssignments 
                    assignments={assignments} 
                    ambulanceServiceId={ambulanceService?.id} 
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'fleet' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V8a1 1 0 00-1-1h-3.05A2.5 2.5 0 0011 5.05V5a1 1 0 00-1-1H3zm0 1h7v3.05A2.5 2.5 0 0012.95 10H17l-3 4v1H5a2.5 2.5 0 00-2 1V5z" />
                  </svg>
                  Fleet Management
                </h2>
                <FleetManagement 
                  fleet={fleet} 
                  ambulanceServiceId={ambulanceService?.id} 
                />
              </div>
            )}
            
            {activeTab === 'bids' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Bidding History
                </h2>
                <BiddingHistory 
                  bids={bids} 
                  ambulanceServiceId={ambulanceService?.id} 
                />
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Revenue & Performance Analytics
                </h2>
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium">Analytics Dashboard</h3>
                  <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                    This section would display charts and graphs showing key metrics such as:
                  </p>
                  <ul className="mt-6 text-gray-600 text-left max-w-md mx-auto space-y-3">
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Revenue by day, week, month, and year</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Bid win rate and average bid amounts</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Vehicle utilization and fuel efficiency</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Response times and customer ratings</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Geographic heat maps of service areas</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 