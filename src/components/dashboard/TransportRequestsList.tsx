'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TransportRequest } from '@/types/database.types';

interface TransportRequestsListProps {
  transportRequests: TransportRequest[];
  hospitalId: string | undefined;
}

export default function TransportRequestsList({ 
  transportRequests, 
  hospitalId 
}: TransportRequestsListProps) {
  const router = useRouter();
  const [recentRequests, setRecentRequests] = useState(
    transportRequests
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
  );

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

  const formatTransportType = (type: string) => {
    return type === 'emergency' ? 'Emergency Transfer' : 'Regular Transfer';
  };
  
  const handleCreateRequest = () => {
    if (!hospitalId) {
      alert('Hospital information is required to create a transport request');
      return;
    }
    
    router.push('/dashboard/transport-requests/new');
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Transport Requests</h2>
        <button
          onClick={handleCreateRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          New Request
        </button>
      </div>
      
      <div className="space-y-4">
        {recentRequests.length > 0 ? (
          recentRequests.map((request) => (
            <Link 
              key={request.id} 
              href={`/dashboard/transport-requests/${request.id}`}
              className="block border-l-4 pl-4 py-3 hover:bg-gray-50 transition-colors"
              style={{ 
                borderLeftColor: request.transportType === 'emergency' ? '#ef4444' : '#3b82f6'
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {formatTransportType(request.transportType)}
                    {request.specialRequirements && ' - '}
                    {request.specialRequirements}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient ID: {request.patientName}
                    {' • '}
                    {formatDate(request.transportDate, request.transportTime)}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No transport requests found
          </div>
        )}
      </div>
      
      {recentRequests.length > 0 && (
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/transport-requests"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Requests →
          </Link>
        </div>
      )}
    </div>
  );
} 