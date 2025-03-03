'use client';

import { useState } from 'react';
import type { Vehicle } from '@/types/database.types';

interface FleetManagementProps {
  fleet: Vehicle[];
  ambulanceServiceId: string | undefined;
}

export default function FleetManagement({ 
  fleet,
  ambulanceServiceId 
}: FleetManagementProps) {
  const [activeVehicle, setActiveVehicle] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Filter vehicles based on status
  const filteredVehicles = filterStatus 
    ? fleet.filter(vehicle => vehicle.status === filterStatus)
    : fleet;
  
  // Get vehicle status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (status === 'available') 
      return `${baseClasses} bg-green-100 text-green-800`;
    if (status === 'assigned') 
      return `${baseClasses} bg-blue-100 text-blue-800`;
    if (status === 'maintenance') 
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (status === 'out-of-service') 
      return `${baseClasses} bg-red-100 text-red-800`;
    
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === null 
                ? 'bg-gray-200 text-gray-800' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilterStatus(null)}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'available' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilterStatus('available')}
          >
            Available
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'assigned' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilterStatus('assigned')}
          >
            On Assignment
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'maintenance' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setFilterStatus('maintenance')}
          >
            Maintenance
          </button>
        </div>
        
        <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
          Add Vehicle
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Vehicle list */}
        <div className="md:col-span-5 lg:col-span-4 border-r">
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    activeVehicle === vehicle.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setActiveVehicle(vehicle.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{vehicle.vehicleNumber}</h3>
                      <p className="text-sm text-gray-600">{vehicle.vehicleType}</p>
                    </div>
                    <span className={getStatusBadge(vehicle.status)}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    License: {vehicle.licensePlate}
                  </div>
                  
                  {vehicle.crew && vehicle.crew.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Crew:</span> {vehicle.crew.join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No vehicles found
              </div>
            )}
          </div>
        </div>
        
        {/* Vehicle details & map */}
        <div className="md:col-span-7 lg:col-span-8">
          {activeVehicle ? (
            fleet.filter(v => v.id === activeVehicle).map(vehicle => (
              <div key={vehicle.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-medium">{vehicle.vehicleNumber}</h2>
                    <p className="text-gray-600">{vehicle.vehicleType}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                      Edit
                    </button>
                    <button 
                      className={`px-3 py-1 text-sm rounded-md ${
                        vehicle.status === 'available' 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {vehicle.status === 'available' ? 'Set Unavailable' : 'Set Available'}
                    </button>
                  </div>
                </div>
                
                {/* Vehicle details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Type:</p>
                        <p>{vehicle.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">License Plate:</p>
                        <p>{vehicle.licensePlate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status:</p>
                        <span className={getStatusBadge(vehicle.status)}>
                          {vehicle.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Maintenance:</p>
                        <p>{new Date(vehicle.lastMaintenance).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Crew Assignment</h3>
                    {vehicle.crew && vehicle.crew.length > 0 ? (
                      <div className="space-y-2">
                        {vehicle.crew.map((member, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{member}</span>
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              Remove
                            </button>
                          </div>
                        ))}
                        <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Crew Member
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-2">No crew members assigned</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Assign Crew
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location map */}
                <div>
                  <h3 className="font-medium mb-2">Current Location</h3>
                  <div className="bg-gray-100 h-64 rounded-lg relative">
                    {/* This would be a real map component in production */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-8 w-8 mx-auto text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          Vehicle location: {vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Maintenance log */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Maintenance Log</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View Full History</button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(vehicle.lastMaintenance).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            Regular service
                          </td>
                          <td className="px-4 py-2 text-sm">
                            Oil change, brake check, and general inspection completed
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {new Date(new Date(vehicle.lastMaintenance).setMonth(new Date(vehicle.lastMaintenance).getMonth() - 3)).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            Equipment check
                          </td>
                          <td className="px-4 py-2 text-sm">
                            All medical equipment verified and restocked
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-500">Select a vehicle</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a vehicle from the list to view details and manage its status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 