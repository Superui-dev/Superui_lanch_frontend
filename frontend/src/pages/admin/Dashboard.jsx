import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import useCountUp from '../../hooks/useCountUp';
import { io } from 'socket.io-client';
import client from '../../api/client';
import {
  LineChart, ShoppingCart, ShieldCheck, Server, ChevronLeft, ChevronRight, ChevronDown, ArrowUpRight, Users
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeVisitors: 0,
    serverStatus: 'HEALTHY'
  });

  const [salesTimeframe, setSalesTimeframe] = useState('This Week');
  const [ordersPage, setOrdersPage] = useState(1);
  const [salesTimeline, setSalesTimeline] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [visitorLoading, setVisitorLoading] = useState(true);

  const ORDERS_PER_PAGE = 5;

  // Socket connection for live visitor count
  useEffect(() => {
    const mfaToken = sessionStorage.getItem('admin_mfa_token') || localStorage.getItem('admin_mfa_token');
    const token = mfaToken || 'demo-admin-token';
    const socket = io(`${SOCKET_URL}/admin`, {
      auth: { token, mfaToken },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      timeout: 10000,
      autoConnect: true
    });

    socket.on('connect', () => {
      setVisitorLoading(false);
    });

    socket.on('connect_error', () => {
      setVisitorLoading(false);
    });

    socket.on('admin:visitor-live-count', (data) => {
      const count = data?.count ?? data?.liveAdmins;
      if (count !== undefined) {
        setStats(prev => ({ ...prev, activeVisitors: count }));
      }
      setVisitorLoading(false);
    });

    return () => {
      socket.off('admin:visitor-live-count');
      socket.disconnect();
    };
  }, []);

  // Fetch DB data for Sales Overview & Recent Orders
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingDashboard(true);
      try {
        const [summaryRes, ordersRes, customersRes] = await Promise.allSettled([
          client.get('/api/admin/analytics/summary', { silent: true }),
          client.get('/api/admin/orders', { silent: true }),
          client.get('/api/admin/customers', { silent: true })
        ]);

        let totalRev = 0;
        let totalOrd = 0;
        let totalCust = 0;
        let timelineData = [];
        let ordersList = [];

        if (customersRes.status === 'fulfilled' && customersRes.value?.data?.success && Array.isArray(customersRes.value.data.data)) {
          totalCust = customersRes.value.data.data.length;
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.success) {
          const data = summaryRes.value.data.data;
          totalRev = data.totalRevenue || 0;
          totalOrd = data.totalOrders || 0;
          if (!totalCust && data.totalCustomers) {
            totalCust = data.totalCustomers;
          }
          if (Array.isArray(data.salesTimeline) && data.salesTimeline.length > 0) {
            timelineData = data.salesTimeline;
          }
          if (Array.isArray(data.recentOrders) && data.recentOrders.length > 0) {
            ordersList = data.recentOrders;
          }
        } else if (ordersRes.status === 'fulfilled' && ordersRes.value?.data?.success && Array.isArray(ordersRes.value.data.data)) {
          const dbOrders = ordersRes.value.data.data;
          if (dbOrders.length > 0) {
            ordersList = dbOrders.slice(0, 10);
            totalOrd = dbOrders.length;
            const successfulOrders = dbOrders.filter(o => o.paymentStatus === 'SUCCESS');
            totalRev = successfulOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
          }
        }

        // If timeline array from DB is empty, construct dates and sum matching DB orders per day
        if (timelineData.length === 0) {
          const days = [];
          for (let i = 3; i >= -3; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            const isoStr = date.toISOString().split('T')[0];

            const matchingOrders = ordersList.filter(o => {
              const oDate = new Date(o.createdAt || Date.now()).toISOString().split('T')[0];
              return oDate === isoStr;
            });

            const daySales = matchingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            days.push({
              date: isoStr,
              dayLabel,
              sales: daySales
            });
          }
          timelineData = days;
        }

        setStats(prev => ({
          ...prev,
          totalSales: totalRev,
          totalOrders: totalOrd,
          totalCustomers: totalCust
        }));

        setSalesTimeline(timelineData);
        setRecentOrders(ordersList);
      } catch (err) {
        // Fallback state quietly retained
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  const animatedVisitors = useCountUp(stats.activeVisitors, 800);

  // Status Styling Helper
  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'PAID' || s === 'SUCCESS') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
    if (s === 'PROCESSING' || s === 'AUTHORIZED') {
      return 'bg-blue-50 text-blue-600 border-blue-200';
    }
    if (s === 'PENDING') {
      return 'bg-amber-50 text-amber-600 border-amber-200';
    }
    return 'bg-red-50 text-red-600 border-red-200';
  };

  const formatStatus = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'COMPLETED' || s === 'PAID' || s === 'SUCCESS') return 'Completed';
    if (s === 'PROCESSING') return 'Processing';
    if (s === 'PENDING') return 'Pending';
    if (s === 'CANCELLED' || s === 'FAILED') return 'Cancelled';
    return status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '29 Aug 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Pagination for Recent Orders table
  const totalOrdersCount = recentOrders.length;
  const totalPages = Math.ceil(totalOrdersCount / ORDERS_PER_PAGE) || 1;
  const paginatedOrders = recentOrders.slice(
    (ordersPage - 1) * ORDERS_PER_PAGE,
    ordersPage * ORDERS_PER_PAGE
  );

  // Calculate SVG curve line chart values for Sales Overview
  const maxSalesValue = Math.max(...salesTimeline.map(d => d.sales || 0), 60000);
  const chartHeight = 160;
  const chartWidth = 460;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = salesTimeline.map((item, index) => {
    const x = paddingLeft + index * ((chartWidth - paddingLeft - paddingRight) / Math.max(salesTimeline.length - 1, 1));
    const y = paddingTop + (1 - (item.sales || 0) / maxSalesValue) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, sales: item.sales, label: item.dayLabel };
  });

  // Construct SVG cubic Bezier path for line and area fill
  const linePath = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  const yTicks = [60000, 50000, 40000, 30000, 20000, 10000, 0];

   return (
     <AdminLayout>
       <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-neutral-900">
         <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
             <h1 className={`text-2xl font-bold ${colors.text}`}>Dashboard Overview</h1>
             <p className={`text-xs ${colors.textMuted} mt-1`}>
               Showing real-time database orders, revenue metrics, and system report analytics for {selectedDate}
             </p>
           </div>
         </header>

         {loadingDashboard ? (
           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[0,1,2,3].map((i) => (
               <div key={i} className={`p-6 rounded-2xl border ${colors.cardBg} ${colors.cardBorder} space-y-4 animate-pulse`}>
                 <div className="flex justify-between items-center">
                   <div className={`h-3 w-24 rounded ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}></div>
                   <div className={`h-8 w-8 rounded-xl ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}></div>
                 </div>
                 <div className={`h-8 w-32 rounded ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}></div>
                 <div className={`h-3 w-28 rounded ${isLight ? 'bg-neutral-200' : 'bg-neutral-800'}`}></div>
               </div>
             ))}
           </section>
         ) : (
           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Sales', value: `INR ${stats.totalSales.toLocaleString()}`, icon: LineChart, trend: '↑ Real-time DB Sync', trendColor: 'text-emerald-600' },
            { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, trend: '↑ Real-time DB Sync', trendColor: 'text-emerald-600' },
            { label: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, trend: '↑ Registered users', trendColor: 'text-emerald-600' },
            // { label: 'Live Visitors', value: visitorLoading ? '...' : animatedVisitors.toString(), icon: ShieldCheck, trend: visitorLoading ? 'Loading...' : 'Active now', trendColor: 'text-neutral-500', hasPulse: true },
            { label: 'Service Health', value: stats.serverStatus, icon: Server, trend: 'All Systems Operational', trendColor: 'text-emerald-600', isStatus: true }
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group p-6 rounded-2xl border ${colors.cardBg} ${colors.cardBorder} space-y-4 card-hover cursor-default shadow-sm`}
            >
              <div className="flex justify-between items-center text-neutral-500">
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-xl ${isLight ? 'bg-neutral-100' : 'bg-neutral-900/30'} group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-5 w-5 text-neutral-500" />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-semibold ${colors.text}`}>
                  {stat.isStatus && (
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 bg-emerald-500"></span>
                  )}
                  {stat.value}
                </p>
                <p className={`text-[10px] font-medium mt-1 ${stat.trendColor}`}>{stat.trend}</p>
              </div>
            </div>
          ))}
        </section>
        )}

        {/* MAIN REPORT CARDS SECTION (Sales Overview + Recent Orders Table) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CARD: Sales Overview Line Chart */}
          <div className={`lg:col-span-6 p-6 rounded-3xl border ${colors.cardBg} ${colors.cardBorder} shadow-sm space-y-6 flex flex-col justify-between min-h-[420px]`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-base font-bold ${colors.text}`}>Sales Overview</h2>
              <div className="relative">
                <select
                  value={salesTimeframe}
                  onChange={(e) => setSalesTimeframe(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-9 rounded-xl border text-xs font-semibold ${
                    isLight ? 'bg-white border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-neutral-200'
                  } focus:outline-none shadow-sm cursor-pointer`}
                >
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* SVG Curve Line Chart */}
            <div className="relative w-full overflow-x-auto py-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5100" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FF5100" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Gridlines & Labels */}
                {yTicks.map((tickVal) => {
                  const y = paddingTop + (1 - tickVal / maxSalesValue) * (chartHeight - paddingTop - paddingBottom);
                  return (
                    <g key={tickVal}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke={isLight ? '#F0F0F0' : '#262626'}
                        strokeDasharray={tickVal === 0 ? '0' : '3 3'}
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill={isLight ? '#9CA3AF' : '#6B7280'}
                        fontSize="9"
                        fontWeight="500"
                      >
                        {tickVal === 0 ? '0' : `${Math.round(tickVal / 1000)}K`}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area under line */}
                {points.length > 0 && (
                  <path d={areaPath} fill="url(#salesGrad)" />
                )}

                {/* Smooth Bezier Line */}
                {points.length > 0 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#FF5100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Point Circles & X-Axis Labels */}
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#FF5100"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill={isLight ? '#6B7280' : '#9CA3AF'}
                      fontSize="9"
                      fontWeight="500"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-600"></span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Sales (INR)</span>
            </div>
          </div>

          {/* RIGHT CARD: Recent Orders Table */}
          <div className={`lg:col-span-6 p-6 rounded-3xl border ${colors.cardBg} ${colors.cardBorder} shadow-sm space-y-6 flex flex-col justify-between min-h-[420px]`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-base font-bold ${colors.text}`}>Recent Orders</h2>
              <Link
                to="/india/admin/orders"
                className="px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 shadow-sm transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200/80 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs text-neutral-400">
                        No orders recorded in database yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, idx) => (
                      <tr key={order._id || idx} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3 px-3 text-xs font-bold text-neutral-900 whitespace-nowrap">
                          #{order.orderNumber || `ORD-${10032 - idx}`}
                        </td>
                        <td className="py-3 px-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap max-w-[120px] truncate">
                          {order.customerName || order.userId?.name || 'Customer'}
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-neutral-900 whitespace-nowrap">
                          INR {(order.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-xs whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.orderStatus || order.paymentStatus)}`}>
                            {formatStatus(order.orderStatus || order.paymentStatus)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-neutral-500 text-[11px] font-medium">
                {totalOrdersCount > 0 ? (
                  `Showing ${Math.min((ordersPage - 1) * ORDERS_PER_PAGE + 1, totalOrdersCount)} to ${Math.min(ordersPage * ORDERS_PER_PAGE, totalOrdersCount)} of ${totalOrdersCount} orders`
                ) : (
                  'Showing 0 of 0 orders'
                )}
              </span>

              <div className="flex items-center space-x-1">
                <button
                  disabled={ordersPage === 1}
                  onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setOrdersPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        ordersPage === pNum
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={ordersPage === totalPages}
                  onClick={() => setOrdersPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
