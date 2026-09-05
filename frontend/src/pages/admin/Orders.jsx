import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Receipt, Mail, Calendar, X, Inbox, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

const Orders = () => {
  const { colors } = useAdminTheme();
  const { selectedDate, setSelectedDate } = useAdminDate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todaySuccess: 0, monthSuccess: 0, failed: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/orders', { silent: true });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      // Quiet fallback
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await client.get('/api/admin/orders/stats', { silent: true });
      if (res.data?.success && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Quiet fallback
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and refund this order?')) return;
    try {
      await client.put(`/api/admin/orders/${id}/cancel`);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert('Failed to cancel order: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const statsCards = [
    { 
      label: "Today's Success", 
      value: stats.todaySuccess, 
      icon: CheckCircle, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Month Success', 
      value: stats.monthSuccess, 
      icon: TrendingUp, 
      color: 'text-brand-600',
      bg: 'bg-brand-50'
    },
    { 
      label: 'Failed', 
      value: stats.failed, 
      icon: XCircle, 
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: AlertTriangle, 
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  const filteredOrders = useMemo(() => {
    if (!selectedDate) return orders;
    return orders.filter(ord => {
      const orderDate = new Date(ord.createdAt).toISOString().split('T')[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredOrders, currentPage]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Purchase Orders</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Review checkouts, cancel active orders, and initialize refunds.</p>
          </div>

          {/* Calendar Date Picker */}
          <AdminDatePicker label="Order Date" />
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${colors.cardBg} ${colors.cardBorder} space-y-3 card-hover`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold ${colors.text}`}>{statsLoading ? '-' : stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${colors.border} bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-slate-300 font-medium uppercase tracking-wider`}>
                  <th className="py-3 px-6">Order Ref</th>
                  <th className="py-3 px-6">Products</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Order Date & Time</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${colors.border} ${colors.textSecondary}`}>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Inbox className={`h-10 w-10 mx-auto ${colors.textMuted} mb-2`} />
                      <p className={`text-sm ${colors.textSecondary} font-medium`}>
                        {selectedDate ? `No orders found for ${selectedDate}` : 'No purchase orders recorded yet'}
                      </p>
                      <p className={`text-xs ${colors.textMuted} mt-1`}>Select another date using the date filter above.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((ord) => {
                    const { date, time } = formatDate(ord.createdAt);
                    const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED'].includes(ord.paymentStatus?.toUpperCase());
                    const isPending = ['PENDING'].includes(ord.paymentStatus?.toUpperCase());
                    return (
                      <tr key={ord._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors duration-150">
                        <td className="py-4 px-6 font-mono font-semibold text-neutral-900">{ord.orderNumber}</td>

                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {ord.items?.slice(0, 3).map((item, idx) => (
                              <Link
                                key={item._id || idx}
                                to={`/products/${item.productId}`}
                                className="relative group"
                                title={item.productName}
                              >
                                <img
                                  src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=100&q=80'}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 group-hover:border-brand-500 transition-all duration-200"
                                />
                                {item.quantity > 1 && (
                                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-500 text-white text-[8px] font-bold flex items-center justify-center">
                                    {item.quantity}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <p className={`font-medium ${colors.text}`}>{ord.customerName}</p>
                          <p className={`text-[10px] ${colors.textSecondary} flex items-center mt-0.5`}>
                            <Mail className="h-3 w-3 mr-1 text-neutral-400" />
                            <span>{ord.customerEmail}</span>
                          </p>
                        </td>

                        <td className={`py-4 px-6 ${colors.textSecondary}`}>
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center text-[10px] text-neutral-500">
                              <span>{time}</span>
                            </div>
                          </div>
                        </td>

                        <td className={`py-4 px-6 font-semibold ${colors.text}`}>INR {ord.totalAmount.toLocaleString()}</td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                            isSuccess
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                              : isPending
                                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className={`px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[10px] font-medium text-neutral-600 dark:text-slate-300 hover:text-neutral-900 hover:border-neutral-300 transition-all duration-200`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {selectedOrder && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${colors.overlay} backdrop-blur-sm`}>
          <div className={`w-full max-w-lg ${colors.bgCard} border ${colors.cardBorder} rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center pb-4 border-b ${colors.border}`}>
              <h2 className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}>Order Audit Details</h2>
              <button type="button" onClick={() => setSelectedOrder(null)} className={`p-1 rounded-lg ${colors.textSecondary} hover:text-white transition-colors`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`grid grid-cols-2 gap-4 border-b ${colors.border} pb-4`}>
                <div>
                  <span className={`${colors.textSecondary} block font-medium mb-1`}>Order Number:</span>
                  <span className={`${colors.text} font-bold font-mono`}>{selectedOrder.orderNumber}</span>
                </div>
                <div>
                  <span className={`${colors.textSecondary} block font-medium mb-1`}>Payment Status:</span>
                  <span className={`${colors.accent} font-bold`}>{selectedOrder.paymentStatus}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className={`font-semibold ${colors.text} uppercase tracking-wider text-[10px]`}>Order Date & Time</p>
                <div className={`p-3.5 rounded-xl ${colors.bgInput} border ${colors.borderInput}`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className={colors.text}>{formatDate(selectedOrder.createdAt).date} at {formatDate(selectedOrder.createdAt).time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className={`font-semibold ${colors.text} uppercase tracking-wider text-[10px]`}>Client Details</p>
                <div className={`p-3.5 rounded-xl ${colors.bgInput} border ${colors.borderInput} space-y-1.5`}>
                  <p className={colors.text}><span className={`font-medium ${colors.textMuted}`}>Name:</span> {selectedOrder.customerName}</p>
                  <p className={colors.text}><span className={`font-medium ${colors.textMuted}`}>Email:</span> {selectedOrder.customerEmail}</p>
                </div>
              </div>

              <div className={`pt-4 border-t ${colors.border}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-semibold ${colors.text}`}>Total Charged:</span>
                  <span className={`text-lg font-bold ${colors.text}`}>INR {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {selectedOrder.paymentStatus === 'COMPLETED' && (
                <div className={`pt-4 border-t ${colors.border}`}>
                  <button
                    onClick={() => handleRefund(selectedOrder._id)}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 font-medium transition-all duration-200 text-center"
                  >
                    Refund Charge
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
