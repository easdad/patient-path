'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TransportRequest } from '@/types/database.types';

interface ActiveTransportsProps {
  transportRequests: TransportRequest[];
  hospitalId: string | undefined;
}

export default function ActiveTransports({ 
  transportRequests, 
  hospitalId 
}: ActiveTransportsProps) {
  const router = useRouter();
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);

  // Mock GPS data for vehicles
  const mockGpsData = {
    'vehicle-1': { lat: 40.7128, lng: -74.0060, heading: 45, speed: 35 },
    'vehicle-2': { lat: 40.7138, lng: -74.0070, heading: 90, speed: 28 },
    'vehicle-3': { lat: 40.7118, lng: -74.0050, heading: 180, speed: 0 },
  };

  // Mock ETA calculation - would be based on real GPS and routing in production
  const calculateETA = (request: TransportRequest) => {
    // Randomly generate ETAs between 5-30 minutes for demo purposes
    const minutes = Math.floor(Math.random() * 25) + 5;
    return `${minutes} minutes`;
  };

  // Format transport type for display
  const formatTransportType = (type: string) => {
    if (type === 'emergency') return 'Emergency';
    if (type === 'non-emergency') return 'Non-Emergency';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format date and time for display
  const formatDateTime = (date: string, time: string) => {
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate} at ${time}`;
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (status === 'assigned') 
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (status === 'in-progress') 
      return `${baseClasses} bg-blue-100 text-blue-800`;
    if (status === 'completed') 
      return `${baseClasses} bg-green-100 text-green-800`;
    
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Transport list panel */}
        <div className="border-r">
          <div className="p-4 border-b">
            <h3 className="font-medium">Active Transports</h3>
          </div>
          
          <div className="divide-y h-96 overflow-y-auto">
            {transportRequests.length > 0 ? (
              transportRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedTransport === request.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedTransport(request.id)}
                >
                  <div className="flex justify-between">
                    <span className={getStatusBadge(request.status)}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      ETA: {calculateETA(request)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium mt-2">
                    {formatTransportType(request.transportType)} Transport
                  </h4>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDateTime(request.transportDate, request.transportTime)}
                  </div>
                  
                  <div className="flex items-center mt-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    {request.pickupLocation || request.pickupCity}
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    {request.dropoffLocation || request.dropoffCity}
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Patient:</span> {request.patientName || 'Not specified'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No active transports found
              </div>
            )}
          </div>
        </div>
        
        {/* Map view panel */}
        <div className="col-span-2">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Real-time Tracking</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={() => setSelectedTransport(null)}
            >
              View All Vehicles
            </button>
          </div>
          
          <div className="h-96 bg-gray-100 relative">
            {/* This would be replaced with an actual map component in production */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mx-auto text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium">GPS Map Integration</h3>
                <p className="mt-1 text-sm text-gray-500">
                  In production, this area would display a real-time map with the location of 
                  ambulances en route to or from your facility. You would be able to track 
                  their position, heading, and estimated arrival time.
                </p>
                {selectedTransport && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
                    <p className="font-medium">Transport #{selectedTransport.substring(0, 8)} Selected</p>
                    <p className="mt-1">The vehicle is currently 
                      <span className="font-medium"> {calculateETA(transportRequests.find(r => r.id === selectedTransport)!)} </span> 
                      away from {
                        transportRequests.find(r => r.id === selectedTransport)?.status === 'assigned' ? 
                        'pickup location' : 'destination'
                      }.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Transport details panel */}
          {selectedTransport && (
            <div className="p-4 border-t">
              <h3 className="font-medium mb-2">Transport Details</h3>
              
              {transportRequests.filter(r => r.id === selectedTransport).map(request => (
                <div key={request.id} className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Pickup:</p>
                    <p className="font-medium">{request.pickupLocation || request.pickupCity}</p>
                    <p>{request.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dropoff:</p>
                    <p className="font-medium">{request.dropoffLocation || request.dropoffCity}</p>
                    <p>{request.dropoffAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Transport Type:</p>
                    <p className="font-medium">{formatTransportType(request.transportType)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Scheduled Time:</p>
                    <p className="font-medium">{formatDateTime(request.transportDate, request.transportTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Patient:</p>
                    <p className="font-medium">{request.patientName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status:</p>
                    <span className={getStatusBadge(request.status)}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <p className="text-gray-500">Special Requirements:</p>
                    <p>{request.specialRequirements || 'None specified'}</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  Contact Driver
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  View Full Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 