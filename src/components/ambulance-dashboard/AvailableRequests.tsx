'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TransportRequest } from '@/types/database.types';

interface AvailableRequestsProps {
  pendingRequests: TransportRequest[];
  ambulanceServiceId: string | undefined;
}

export default function AvailableRequests({ 
  pendingRequests, 
  ambulanceServiceId 
}: AvailableRequestsProps) {
  const router = useRouter();
  const [recentRequests, setRecentRequests] = useState(
    pendingRequests
      .sort((a, b) => new Date(a.transportDate).getTime() - new Date(b.transportDate).getTime())
      .slice(0, 4)
  );

  const formatTransportType = (type: string) => {
    return type === 'emergency' ? 'Emergency Transfer' : 'Regular Transfer';
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
        <h2 className="text-xl font-semibold">Available Transport Requests</h2>
      </div>
      
      <div className="space-y-4">
        {recentRequests.length > 0 ? (
          recentRequests.map((request) => (
            <Link 
              key={request.id} 
              href={`/ambulance-dashboard/available-requests/${request.id}`}
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
                    {formatDate(request.transportDate, request.transportTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    From: {request.pickupCity} • To: {request.dropoffCity}
                  </p>
                </div>
                <button
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  onClick={(e) => {
                    e.preventDefault();
                    if (ambulanceServiceId) {
                      router.push(`/ambulance-dashboard/available-requests/${request.id}/bid`);
                    } else {
                      alert('You need to complete your ambulance service profile first');
                    }
                  }}
                >
                  Place Bid
                </button>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No available transport requests found
          </div>
        )}
      </div>
      
      {recentRequests.length > 0 && (
        <div className="mt-4 text-center">
          <Link
            href="/ambulance-dashboard/available-requests"
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            View All Available Requests →
          </Link>
        </div>
      )}
    </div>
  );
} 