'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import WheelLoader from '@/components/WheelLoader';

// Visitor Statistics Card Component
interface VisitorStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const VisitorStatsCard: React.FC<VisitorStatsCardProps> = ({
  title,
  value,
  icon,
  trend
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl md:rounded-2xl lg:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 md:p-5 lg:p-8 text-left transition-all hover:border-zinc-700"
  >
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <div className="p-2 md:p-3 bg-blue-600/10 rounded-xl text-blue-500">
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-xs ${
          trend.isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          <span>{trend.isPositive ? '↗' : '↘'} {trend.value}%</span>
        </div>
      )}
    </div>
    <p className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter font-jakarta text-white">
      {value.toLocaleString()}
    </p>
    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-2 md:mt-3">
      {title}
    </p>
  </motion.div>
);

// Product Statistics Table Component
interface ProductStatsTableProps {
  products: Array<{
    productId: string;
    productName: string;
    productImage: string;
    productCategory?: string;
    viewCount: number;
    percentage: number;
  }>;
  isLoading: boolean;
  error?: string;
}

const ProductStatsTable: React.FC<ProductStatsTableProps> = ({
  products,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl md:rounded-3xl border border-zinc-900 bg-zinc-900/20 p-6 md:p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-8 h-8 bg-zinc-700 rounded"></div>
              <div className="w-16 h-16 bg-zinc-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-zinc-700 rounded"></div>
                <div className="w-24 h-3 bg-zinc-700 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-zinc-700 rounded"></div>
              <div className="w-12 h-4 bg-zinc-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl md:rounded-3xl border border-rose-900/50 bg-rose-950/20 p-6 md:p-8 text-center">
        <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl md:rounded-3xl border border-zinc-900 bg-zinc-900/20 p-6 md:p-8 text-center">
        <p className="text-zinc-600 text-sm font-black uppercase tracking-widest">
          No product views yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl md:rounded-3xl border border-zinc-900 bg-zinc-900/20 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-900">
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
          Top Products
        </h2>
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-2">
          Most viewed products
        </p>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                Product
              </th>
              <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                Views
              </th>
              <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {products.map((product, index) => (
              <motion.tr
                key={product.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-zinc-800/10 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20">
                    <span className="text-sm font-black text-blue-500">
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.productImage || 'https://via.placeholder.com/64x64?text=No+Image'}
                      alt={product.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                    <div>
                      <p className="text-sm font-black text-white">
                        {product.productName}
                      </p>
                      {product.productCategory && (
                        <p className="text-xs text-zinc-500 font-bold mt-1">
                          {product.productCategory}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-lg font-black text-white">
                    {product.viewCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(product.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 min-w-[3rem]">
                      {product.percentage}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {products.map((product, index) => (
          <motion.div
            key={product.productId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-zinc-900 bg-zinc-900/30 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/10 border border-blue-500/20">
                <span className="text-xs font-black text-blue-500">
                  {index + 1}
                </span>
              </div>
              <img
                src={product.productImage || 'https://via.placeholder.com/48x48?text=No+Image'}
                alt={product.productName}
                className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">
                  {product.productName}
                </p>
                {product.productCategory && (
                  <p className="text-xs text-zinc-500 font-bold">
                    {product.productCategory}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-white">
                  {product.viewCount.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-600 font-bold">views</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-400">
                  {product.percentage}%
                </p>
                <div className="w-16 bg-zinc-800 rounded-full h-1.5 mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(product.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Error Boundary Component
class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center rounded-2xl border border-rose-900/50 bg-rose-950/20">
          <h2 className="text-lg font-semibold text-rose-400 mb-2">
            Analytics Temporarily Unavailable
          </h2>
          <p className="text-zinc-400 mb-4">
            We're having trouble loading analytics data. Please try again later.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Analytics Page Component
export default function AdminAnalyticsPage() {
  const { logout } = useAuth();
  const { data, visitorStats, productStats, isLoading, error, refetch } = useAnalytics();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        <main className="flex-1 overflow-y-auto pt-20 md:pt-0 px-5 py-6 md:p-14">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 md:mb-8 lg:mb-16">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                Analytics <span className="text-zinc-800">Dashboard</span>
              </h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-2 md:mt-3 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                Real-time insights and performance metrics
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refetch}
                disabled={isLoading}
                className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all flex-shrink-0 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          <AnalyticsErrorBoundary>
            {/* Visitor Statistics */}
            <section className="mb-8 md:mb-12 lg:mb-16">
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6">
                📊 Visitor Statistics
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl md:rounded-2xl lg:rounded-3xl border border-zinc-900 bg-zinc-900/30 p-4 md:p-5 lg:p-8 animate-pulse">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-zinc-700 rounded-xl"></div>
                        <div className="w-16 h-4 bg-zinc-700 rounded"></div>
                      </div>
                      <div className="w-20 h-8 bg-zinc-700 rounded mb-2"></div>
                      <div className="w-24 h-4 bg-zinc-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6">
                  <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <VisitorStatsCard
                    title="Total Visits"
                    value={visitorStats?.totalVisits || 0}
                    icon={
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                  <VisitorStatsCard
                    title="Last 24 Hours"
                    value={visitorStats?.last24Hours || 0}
                    icon={
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  />
                  <VisitorStatsCard
                    title="Last 7 Days"
                    value={visitorStats?.last7Days || 0}
                    icon={
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>
              )}
            </section>

            {/* Product Statistics */}
            <section>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6">
                🏆 Product Performance
              </h2>
              <ProductStatsTable
                products={productStats}
                isLoading={isLoading}
                error={error || undefined}
              />
            </section>
          </AnalyticsErrorBoundary>
        </main>
      </div>
    </ProtectedRoute>
  );
}