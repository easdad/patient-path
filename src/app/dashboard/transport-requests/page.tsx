'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';
import { getTransportRequestsByHospitalId } from '@/lib/db/transport-requests';
import { getHospitalByUserId } from '@/lib/db/hospitals';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNav from '@/components/dashboard/DashboardNav';
import type { TransportRequest, User, Hospital } from '@/types/database.types';
import Link from 'next/link';

export default function TransportRequests() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: currentUser, error } = await getCurrentUser();
        
        if (error || !currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        if (currentUser.userType === 'hospital') {
          const { data: hospitalData } = await getHospitalByUserId(currentUser.id);
          setHospital(hospitalData);
          
          if (hospitalData) {
            const { data: requests } = await getTransportRequestsByHospitalId(hospitalData.id);
            setTransportRequests(requests || []);
          }
        } else {
          router.push('/ambulance-dashboard');
        }
      } catch (error) {
        console.error('Error loading transport requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const getStatusBadge = (status: TransportRequest['status']) => {
    const statusConfig = {
      pending: { 
        label: 'PENDING', 
        classes: 'bg-yellow-100 text-yellow-800' 
      },
      assigned: { 
        label: 'ASSIGNED', 
        classes: 'bg-blue-100 text-blue-800' 
      },
      'in-progress': { 
        label: 'EN ROUTE', 
        classes: 'bg-green-100 text-green-800' 
      },
      completed: { 
        label: 'ARRIVED', 
        classes: 'bg-purple-100 text-purple-800' 
      },
      cancelled: { 
        label: 'CANCELLED', 
        classes: 'bg-red-100 text-red-800' 
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    return `${formattedDate} ${timeString}`;
  };

  const filteredRequests = filterStatus === 'all' 
    ? transportRequests 
    : transportRequests.filter(req => req.status === filterStatus);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading transport requests...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} hospital={hospital} />
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transport Requests</h1>
          <Link
            href="/dashboard/transport-requests/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            New Request
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('assigned')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === 'assigned' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                Assigned
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === 'in-progress' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === 'completed' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transport Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From / To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.patientName}</div>
                        <div className="text-sm text-gray-500">DOB: {new Date(request.patientDob).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${request.transportType === 'emergency' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {request.transportType === 'emergency' ? 'Emergency' : 'Non-Emergency'}
                        </div>
                        {request.specialRequirements && (
                          <div className="text-sm text-gray-500">{request.specialRequirements}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.transportDate, request.transportTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          From: {request.pickupAddress}, {request.pickupCity}
                        </div>
                        <div className="text-sm text-gray-500">
                          To: {request.dropoffAddress}, {request.dropoffCity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/dashboard/transport-requests/${request.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No transport requests found
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