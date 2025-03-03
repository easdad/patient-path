'use client';

interface AmbulanceDashboardMetricsProps {
  activeBids: number;
  activeAssignments: number;
  completedToday: number;
}

export default function AmbulanceDashboardMetrics({
  activeBids,
  activeAssignments,
  completedToday,
}: AmbulanceDashboardMetricsProps) {
  const metrics = [
    {
      id: 'active-bids',
      value: activeBids,
      label: 'Active Bids',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      id: 'active-assignments',
      value: activeAssignments,
      label: 'Active Transports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 'completed-today',
      value: completedToday,
      label: 'Completed Today',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`rounded-full p-3 ${metric.color}`}>
              {metric.icon}
            </div>
            <div className="ml-5">
              <div className="text-3xl font-bold">{metric.value}</div>
              <div className="text-gray-500">{metric.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 