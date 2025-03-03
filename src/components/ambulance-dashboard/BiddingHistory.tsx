'use client';

import { useState } from 'react';
import type { TransportBid } from '@/types/database.types';

interface BiddingHistoryProps {
  bids: TransportBid[];
  ambulanceServiceId: string | undefined;
}

export default function BiddingHistory({ 
  bids,
  ambulanceServiceId 
}: BiddingHistoryProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter bids based on status
  const filteredBids = filterStatus 
    ? bids.filter(bid => bid.status === filterStatus)
    : bids;
  
  // Sort bids
  const sortedBids = [...filteredBids].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' 
        ? a.bidAmount - b.bidAmount 
        : b.bidAmount - a.bidAmount;
    }
  });
  
  // Calculate statistics
  const totalBids = bids.length;
  const acceptedBids = bids.filter(bid => bid.status === 'accepted').length;
  const pendingBids = bids.filter(bid => bid.status === 'pending').length;
  const rejectedBids = bids.filter(bid => bid.status === 'rejected').length;
  
  // Calculate win rate
  const winRate = totalBids > 0 
    ? Math.round((acceptedBids / totalBids) * 100) 
    : 0;
  
  // Calculate average bid amount
  const avgBidAmount = totalBids > 0 
    ? Math.round(bids.reduce((sum, bid) => sum + bid.bidAmount, 0) / totalBids) 
    : 0;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };
  
  // Get bid status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (status === 'accepted') 
      return `${baseClasses} bg-green-100 text-green-800`;
    if (status === 'pending') 
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    if (status === 'rejected') 
      return `${baseClasses} bg-red-100 text-red-800`;
    
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Total Bids</div>
            <div className="text-xl font-semibold">{totalBids}</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Win Rate</div>
            <div className="text-xl font-semibold">{winRate}%</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Avg. Bid Amount</div>
            <div className="text-xl font-semibold">${avgBidAmount}</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Pending Bids</div>
            <div className="text-xl font-semibold">{pendingBids}</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          {/* Status filters */}
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
                filterStatus === 'accepted' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setFilterStatus('accepted')}
            >
              Accepted
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'rejected' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected
            </button>
          </div>
          
          {/* Sort controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select 
              className="text-sm border rounded-md p-1"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as 'date' | 'amount');
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBids.length > 0 ? (
              sortedBids.map((bid) => (
                <tr key={bid.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bid.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    #{bid.transportRequestId.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* In a real app, we would display the hospital name from the transport request */}
                    Memorial Hospital
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    ${bid.bidAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(bid.status)}>
                      {bid.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View
                      </button>
                      {bid.status === 'pending' && (
                        <button className="text-red-600 hover:text-red-800 font-medium">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No bidding history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-4">Bidding Performance</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium">Bid Performance Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">
            In a production environment, this section would display charts and analytics 
            tracking your bidding performance over time, including win rates, competitive 
            analysis, and optimal pricing strategies.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">Win Rate Trend</div>
              <div className="h-24 flex items-end justify-around mt-2">
                {[65, 70, 55, 62, 78, 80, 75].map((value, i) => (
                  <div key={i} className="w-6 bg-red-500 rounded-t" style={{ height: `${value}%` }}></div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 7 days</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">Avg. Bid Amount</div>
              <div className="h-24 flex items-end justify-around mt-2">
                {[550, 520, 580, 600, 530, 540, 570].map((value, i) => (
                  <div key={i} className="w-6 bg-blue-500 rounded-t" style={{ height: `${value/6}%` }}></div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 7 days</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-sm text-gray-500">Bids Submitted</div>
              <div className="h-24 flex items-end justify-around mt-2">
                {[8, 12, 6, 9, 15, 11, 7].map((value, i) => (
                  <div key={i} className="w-6 bg-green-500 rounded-t" style={{ height: `${value*5}%` }}></div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 7 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 