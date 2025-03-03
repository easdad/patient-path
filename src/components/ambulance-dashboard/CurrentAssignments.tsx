'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransport, completeTransport } from '@/lib/db/transport-assignments';
import type { TransportAssignment } from '@/types/database.types';

interface CurrentAssignmentsProps {
  assignments: TransportAssignment[];
  ambulanceServiceId: string | undefined;
}

export default function CurrentAssignments({ 
  assignments, 
  ambulanceServiceId 
}: CurrentAssignmentsProps) {
  const router = useRouter();
  const [activeAssignments, setActiveAssignments] = useState(
    assignments
      .filter(a => ['assigned', 'in-progress'].includes(a.status))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 4)
  );

  const getStatusBadge = (status: TransportAssignment['status']) => {
    const statusConfig = {
      assigned: { 
        label: 'ASSIGNED', 
        classes: 'bg-blue-100 text-blue-800' 
      },
      'in-progress': { 
        label: 'IN PROGRESS', 
        classes: 'bg-green-100 text-green-800' 
      },
      completed: { 
        label: 'COMPLETED', 
        classes: 'bg-purple-100 text-purple-800' 
      },
      cancelled: { 
        label: 'CANCELLED', 
        classes: 'bg-red-100 text-red-800' 
      },
    };

    const config = statusConfig[status] || statusConfig.assigned;
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const handleStartTransport = async (assignmentId: string) => {
    try {
      const { data, error } = await startTransport(assignmentId);
      if (error) throw error;
      
      // Update the local state
      setActiveAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId 
            ? { ...a, status: 'in-progress' as const, startTime: new Date().toISOString() } 
            : a
        )
      );
    } catch (err) {
      console.error('Error starting transport:', err);
      alert('Failed to start transport. Please try again.');
    }
  };

  const handleCompleteTransport = async (assignmentId: string) => {
    try {
      const { data, error } = await completeTransport(assignmentId);
      if (error) throw error;
      
      // Update the local state
      setActiveAssignments(prev => prev.filter(a => a.id !== assignmentId));
    } catch (err) {
      console.error('Error completing transport:', err);
      alert('Failed to complete transport. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Current Assignments</h2>
      </div>
      
      <div className="space-y-4">
        {activeAssignments.length > 0 ? (
          activeAssignments.map((assignment) => (
            <div 
              key={assignment.id} 
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">
                    Transport #{assignment.transportRequestId.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {assignment.startTime 
                      ? `Started: ${new Date(assignment.startTime).toLocaleTimeString()}` 
                      : 'Not started yet'}
                  </p>
                </div>
                {getStatusBadge(assignment.status)}
              </div>
              
              <div className="flex justify-end space-x-2 mt-2">
                <Link
                  href={`/ambulance-dashboard/active-transports/${assignment.id}`}
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                >
                  View Details
                </Link>
                
                {assignment.status === 'assigned' && (
                  <button
                    onClick={() => handleStartTransport(assignment.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Start Transport
                  </button>
                )}
                
                {assignment.status === 'in-progress' && (
                  <button
                    onClick={() => handleCompleteTransport(assignment.id)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No active assignments found
          </div>
        )}
      </div>
      
      {activeAssignments.length > 0 && (
        <div className="mt-4 text-center">
          <Link
            href="/ambulance-dashboard/active-transports"
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            View All Active Transports →
          </Link>
        </div>
      )}
    </div>
  );
} 