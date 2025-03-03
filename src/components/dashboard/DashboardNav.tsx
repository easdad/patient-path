'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Transport Requests', path: '/dashboard/transport-requests' },
    { name: 'Ambulance Fleet', path: '/dashboard/ambulance-fleet' },
    { name: 'Transport History', path: '/dashboard/transport-history' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
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
                  ? 'border-blue-500 text-gray-900'
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