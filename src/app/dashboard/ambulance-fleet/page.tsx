'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';
import { getHospitalByUserId } from '@/lib/db/hospitals';
import { getAllAmbulanceServices } from '@/lib/db/ambulance-services';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardNav from '@/components/dashboard/DashboardNav';
import type { User, Hospital, AmbulanceService } from '@/types/database.types';

interface AmbulanceWithDetails extends AmbulanceService {
  fleetDetails: {
    id: string;
    type: string;
    status: 'Available' | 'On Call' | 'Busy' | 'Maintenance';
    lastService: string;
  }[];
}

export default function AmbulanceFleet() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [ambulanceServices, setAmbulanceServices] = useState<AmbulanceWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
          
          // Fetch ambulance services
          const { data: services } = await getAllAmbulanceServices();
          
          // Add mock fleet details for each service
          const servicesWithFleet = services?.map(service => {
            const fleetCount = service.fleetSize || 3;
            const fleetDetails = [];
            
            for (let i = 0; i < fleetCount; i++) {
              const types = ['ALS (Advanced Life Support)', 'BLS (Basic Life Support)', 'Critical Care Transport'];
              const statuses: Array<'Available' | 'On Call' | 'Busy' | 'Maintenance'> = 
                ['Available', 'On Call', 'Busy', 'Maintenance'];
              
              // Generate a random date in the last 6 months for last service
              const lastService = new Date();
              lastService.setMonth(lastService.getMonth() - Math.floor(Math.random() * 6));
              
              fleetDetails.push({
                id: `#${['A', 'B', 'C'][i % 3]}-${100 + Math.floor(Math.random() * 900)}`,
                type: types[i % 3],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lastService: lastService.toISOString().split('T')[0]
              });
            }
            
            return {
              ...service,
              fleetDetails
            };
          }) || [];
          
          setAmbulanceServices(servicesWithFleet);
        } else {
          router.push('/ambulance-dashboard');
        }
      } catch (error) {
        console.error('Error loading ambulance fleet data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { classes: string }> = {
      'Available': { classes: 'bg-green-100 text-green-800' },
      'On Call': { classes: 'bg-red-100 text-red-800' },
      'Busy': { classes: 'bg-yellow-100 text-yellow-800' },
      'Maintenance': { classes: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig['Busy'];
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${config.classes}`}>
        {status}
      </span>
    );
  };

  const filteredServices = searchTerm 
    ? ambulanceServices.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.fleetDetails.some(vehicle => 
          vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : ambulanceServices;

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading ambulance fleet data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} hospital={hospital} />
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ambulance Fleet</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search ambulances..."
              className="px-4 py-2 border rounded-md w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
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
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold">{service.name}</h2>
                  <p className="text-sm text-gray-600">
                    {service.address}, {service.city}, {service.state} {service.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Contact: {service.contactPhone} | {service.contactEmail}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ambulance ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Service
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {service.fleetDetails.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-blue-600 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3a1 1 0 00-.293-.707l-2-2A1 1 0 0012 7h-1V5a1 1 0 00-1-1H3z" />
                                </svg>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.lastService}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              View Details
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              Request
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No ambulance services found
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 