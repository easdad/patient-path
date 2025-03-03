'use client';

interface DashboardMetricsProps {
  activeRequests: number;
  avgResponseTime: number;
  transportsToday: number;
}

export default function DashboardMetrics({
  activeRequests,
  avgResponseTime,
  transportsToday,
}: DashboardMetricsProps) {
  const metrics = [
    {
      id: 'active-requests',
      value: activeRequests,
      label: 'Active Requests',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'avg-response',
      value: avgResponseTime,
      label: 'Avg. Response Time',
      unit: 'min',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'transports-today',
      value: transportsToday,
      label: 'Transports Today',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
              <div className="flex items-end">
                <span className="text-3xl font-bold">{metric.value}</span>
                {metric.unit && (
                  <span className="text-gray-600 ml-1 mb-1">{metric.unit}</span>
                )}
              </div>
              <div className="text-gray-500">{metric.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 