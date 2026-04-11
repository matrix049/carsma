'use client';

import React, { useState } from 'react';
import { Order, updateOrderStatus } from '@/lib/apiServices';

interface OrderTableProps {
  orders: Order[];
  onOrderUpdated: () => void;
}

export default function OrderTable({ orders, onOrderUpdated }: OrderTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      onOrderUpdated();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800/50';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">No orders found.</p>
      </div>
    );
  }

  // Reverse so newest orders are explicitly at top
  const sortedOrders = [...orders].reverse();

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <tr>
            <th className="px-6 py-4 font-semibold">Order ID</th>
            <th className="px-6 py-4 font-semibold">Customer</th>
            <th className="px-6 py-4 font-semibold">Items</th>
            <th className="px-6 py-4 font-semibold">Total</th>
            <th className="px-6 py-4 font-semibold">Status / Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {sortedOrders.map((order) => {
            // Safe parse the concatenated address string generated at Checkout
            const fullRawStr = order.customer.address || '';
            const [physicalAddress, notesString] = fullRawStr.includes('| Notes:') 
              ? fullRawStr.split('| Notes:') 
              : [fullRawStr, null];

            return (
            <tr key={order._id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/20">
              <td className="px-6 py-4 align-top">
                <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100" title={order._id}>
                  #{order._id.slice(-6)}
                </div>
                <div className="text-xs text-zinc-500 mt-2 font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                  <br />
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
                {order.paymentMethod === 'cod' && (
                  <span className="mt-3 inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    COD
                  </span>
                )}
              </td>
              <td className="px-6 py-4 align-top">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1">{order.customer.firstName} {order.customer.lastName}</div>
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-3">{order.customer.phone}</div>
                <div className="text-xs leading-relaxed max-w-xs whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300">
                  <span className="font-semibold block mb-1 text-zinc-500 dark:text-zinc-400">Address:</span>
                  {physicalAddress.trim()}
                </div>
                {notesString && notesString.trim().length > 0 && (
                  <div className="text-xs leading-relaxed max-w-xs mt-3 rounded-lg bg-yellow-50 p-3 border border-yellow-100 text-yellow-900 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-200">
                    <span className="font-semibold block mb-1 text-yellow-700 dark:text-yellow-500">Cust Notes:</span>
                    {notesString.trim()}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 align-top">
                <div className="space-y-4">
                  {order.products.map((p, idx) => (
                    <div key={idx} className="flex gap-3 text-sm items-start">
                      <span className="font-bold text-zinc-400">{p.quantity}x</span> 
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 align-top font-bold text-zinc-900 dark:text-zinc-100 text-lg whitespace-nowrap">
                {order.totalPrice.toFixed(0)} <span className="text-sm">MAD</span>
              </td>
              <td className="px-6 py-4 align-top">
                <div className="flex flex-col gap-3 max-w-[150px]">
                  <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  
                  <div className="relative mt-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e)}
                      disabled={updatingId === order._id}
                      className={`block w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${updatingId === order._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  {updatingId === order._id && <span className="text-xs text-blue-500 animate-pulse font-medium">Updating...</span>}
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
