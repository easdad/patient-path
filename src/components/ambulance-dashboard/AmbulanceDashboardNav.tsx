'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AmbulanceDashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { name: 'Dashboard', path: '/ambulance-dashboard' },
    { name: 'Available Requests', path: '/ambulance-dashboard/available-requests' },
    { name: 'My Bids', path: '/ambulance-dashboard/my-bids' },
    { name: 'Active Transports', path: '/ambulance-dashboard/active-transports' },
    { name: 'Transport History', path: '/ambulance-dashboard/transport-history' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/ambulance-dashboard') {
      return pathname === '/ambulance-dashboard';
    }
    return pathname.startsWith(path);
  };
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(path);
  };
  
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={handleNavigation(item.path)}
              className={`inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium border-b-2 ${
                isActive(item.path)
                  ? 'border-purple-600 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
} 