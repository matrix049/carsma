'use client';

import React, { useState } from 'react';
import { CustomOrder, updateCustomOrderStatus } from '@/lib/apiServices';

interface CustomOrderTableProps {
  orders: CustomOrder[];
  onOrderUpdated: () => void;
}

export default function CustomOrderTable({ orders, onOrderUpdated }: CustomOrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (requestId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CustomOrder['status'];
    setUpdatingId(requestId);
    try {
      await updateCustomOrderStatus(requestId, newStatus);
      onOrderUpdated();
    } catch (error) {
      console.error('Failed to update custom order status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/50';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'contacted': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">No custom requests found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Customer</th>
            <th className="px-6 py-4 font-semibold">Car Details</th>
            <th className="px-6 py-4 font-semibold">Notes</th>
            <th className="px-6 py-4 font-semibold">Status / Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {orders.map((order) => (
            <tr key={order._id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20">
              <td className="px-6 py-4 align-top whitespace-nowrap">
                <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{order.customer.firstName} {order.customer.lastName}</div>
                <div className="text-xs mt-1">{order.customer.email}</div>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">{order.customer.phone}</div>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">{order.carDetails.carName}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{order.carDetails.model}</div>
                <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Year: {order.carDetails.year}
                </span>
              </td>
              <td className="px-6 py-4 align-top">
                <p className="text-xs leading-relaxed max-w-xs whitespace-pre-wrap italic">
                  {order.notes || 'No notes provided.'}
                </p>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="flex flex-col gap-3 min-w-[140px]">
                  <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-bold capitalize ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  
                  <div className="relative mt-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e)}
                      disabled={updatingId === order._id}
                      className={`block w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${updatingId === order._id ? 'opacity-50' : 'cursor-pointer'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {updatingId === order._id && <span className="text-[10px] text-blue-500 animate-pulse font-medium">Updating...</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
