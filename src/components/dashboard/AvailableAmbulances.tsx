'use client';

import { useState, useEffect } from 'react';
import type { AmbulanceService } from '@/types/database.types';

interface AmbulanceData extends AmbulanceService {
  status: 'Available' | 'On Call' | 'Busy';
  ambulanceId: string;
  type: string;
}

interface AvailableAmbulancesProps {
  ambulanceServices: AmbulanceService[];
}

export default function AvailableAmbulances({ ambulanceServices }: AvailableAmbulancesProps) {
  const [ambulances, setAmbulances] = useState<AmbulanceData[]>([]);

  useEffect(() => {
    // In a real application, this would come from a real-time socket or API call
    // Here we're generating mock data based on the ambulance services
    const mockAmbulanceData: AmbulanceData[] = [];
    
    ambulanceServices.forEach(service => {
      // Create 2-3 ambulances for each service
      const count = Math.min(service.fleetSize, 3);
      
      for (let i = 0; i < count; i++) {
        const types = [
          'ALS (Advanced Life Support)',
          'BLS (Basic Life Support)',
          'Critical Care Transport'
        ];
        
        const statuses: Array<'Available' | 'On Call' | 'Busy'> = ['Available', 'On Call', 'Busy'];
        const randomStatus = Math.random() < 0.6 ? 'Available' : (Math.random() < 0.5 ? 'On Call' : 'Busy');
        
        mockAmbulanceData.push({
          ...service,
          ambulanceId: `#${['A', 'B', 'C'][i % 3]}-${100 + Math.floor(Math.random() * 900)}`,
          type: types[i % 3],
          status: randomStatus
        });
      }
    });
    
    setAmbulances(mockAmbulanceData
      .filter(a => a.status === 'Available' || a.status === 'On Call')
      .slice(0, 6)
    );
  }, [ambulanceServices]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { classes: string }> = {
      'Available': { classes: 'bg-green-100 text-green-800' },
      'On Call': { classes: 'bg-red-100 text-red-800' },
      'Busy': { classes: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig['Busy'];
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${config.classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Available Ambulances Nearby</h2>
      </div>
      
      <div className="space-y-4">
        {ambulances.length > 0 ? (
          ambulances.map((ambulance, index) => (
            <div 
              key={`${ambulance.id}-${index}`} 
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-9l2.1-4.63A2 2 0 016 6h12a2 2 0 011.9 1.37L22 12v9a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1zM5 14h14v2H5v-2zm0-4.67L6.5 8h11l1.5 1.33V12H5v-2.67z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">
                    Ambulance {ambulance.ambulanceId}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {ambulance.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ambulance.name}
                  </p>
                </div>
              </div>
              {getStatusBadge(ambulance.status)}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No ambulances available nearby
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All Nearby Ambulances →
        </button>
      </div>
    </div>
  );
} 