import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { CreditCard, CheckCircle, AlertTriangle, Calendar, Filter, Inbox, Loader2 } from 'lucide-react';

const Payments = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/payments', { silent: true });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setPayments(res.data.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.warn('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (filter !== 'all') {
      result = result.filter(p => {
        const s = (p.status || '').toLowerCase();
        if (filter === 'verified') return s === 'verified' || s === 'success' || s === 'completed';
        return s === filter;
      });
    }
    if (selectedDate) {
      result = result.filter(p => new Date(p.createdAt || p.date).toISOString().split('T')[0] === selectedDate);
    }
    return result;
  }, [payments, filter, selectedDate]);

  const paginatedPayments = useMemo(() => {
    return filteredPayments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredPayments, currentPage]);

  const todayPayments = useMemo(() => payments.filter(p => new Date(p.createdAt || p.date).toDateString() === new Date().toDateString()), [payments]);
  const monthPayments = useMemo(() => payments.filter(p => {
    const d = new Date(p.createdAt || p.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [payments]);
  const yearPayments = useMemo(() => payments.filter(p => new Date(p.createdAt || p.date).getFullYear() === new Date().getFullYear()), [payments]);
  const pendingFailed = useMemo(() => payments.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'pending' || s === 'failed';
  }), [payments]);

  const stats = useMemo(() => [
    { 
      label: "Today's Payments", 
      count: todayPayments.length, 
      amount: todayPayments.reduce((sum, p) => {
        const s = (p.status || '').toLowerCase();
        const active = s === 'verified' || s === 'success' || s === 'completed';
        return sum + (active ? p.amount : 0);
      }, 0), 
      icon: Calendar, 
      color: 'text-brand-600' 
    },
    { 
      label: 'This Month', 
      count: monthPayments.length, 
      amount: monthPayments.reduce((sum, p) => {
        const s = (p.status || '').toLowerCase();
        const active = s === 'verified' || s === 'success' || s === 'completed';
        return sum + (active ? p.amount : 0);
      }, 0), 
      icon: Calendar, 
      color: 'text-emerald-600' 
    },
    { 
      label: 'This Year', 
      count: yearPayments.length, 
      amount: yearPayments.reduce((sum, p) => {
        const s = (p.status || '').toLowerCase();
        const active = s === 'verified' || s === 'success' || s === 'completed';
        return sum + (active ? p.amount : 0);
      }, 0), 
      icon: Calendar, 
      color: 'text-secondary-600' 
    },
    { 
      label: 'Pending / Failed', 
      count: pendingFailed.length, 
      amount: pendingFailed.reduce((sum, p) => sum + p.amount, 0), 
      icon: AlertTriangle, 
      color: 'text-red-600' 
    }
  ], [todayPayments, monthPayments, yearPayments, pendingFailed]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'verified', label: 'Success' },
    { key: 'pending', label: 'Pending' },
    { key: 'failed', label: 'Failed' }
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Payment Transactions</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Review financial checkouts, gateway verification logs, and webhook statuses.</p>
          </div>

          <AdminDatePicker label="Payment Date" />
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${colors.cardBg} ${colors.cardBorder} space-y-3 card-hover`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase tracking-wider ${colors.textSecondary}`}>{stat.label}</span>
                <div className={`p-2 rounded-xl ${isLight ? 'bg-neutral-100' : 'bg-neutral-900/30'}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold ${colors.text}`}>{stat.count}</p>
                <p className={`text-xs ${colors.textSecondary} mt-1`}>INR {stat.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                filter === f.key
                  ? 'bg-brand-500 text-white shadow-lg'
                  : `${isLight ? 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50' : 'bg-neutral-900 border border-neutral-700 text-slate-300 hover:bg-neutral-800'}`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${colors.border} bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-slate-300 font-medium uppercase tracking-wider`}>
                    <th className="py-3 px-6">Transaction ID</th>
                    <th className="py-3 px-6">Order Ref</th>
                    <th className="py-3 px-6">Payment Method</th>
                    <th className="py-3 px-6">Amount Paid</th>
                    <th className="py-3 px-6">Gateway Signature</th>
                    <th className="py-3 px-6 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${colors.border} ${colors.textSecondary}`}>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Inbox className={`h-10 w-10 mx-auto ${colors.textMuted} mb-2`} />
                      <p className={`text-sm ${colors.textSecondary} font-medium`}>
                        {selectedDate ? `No payment transactions found for ${selectedDate}` : 'No payment transactions recorded yet'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((p) => {
                    const isSuccess = p.status === 'verified' || p.status === 'success' || p.rawStatus === 'SUCCESS' || p.rawStatus === 'PAID';
                    const isPending = p.status === 'pending' || p.rawStatus === 'PENDING';
                    return (
                      <tr key={p._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <p className="font-mono font-semibold text-neutral-900">{p.transactionId || p.paymentId || 'N/A'}</p>
                          <p className="text-[10px] text-neutral-400 font-sans">{p.customerName || 'Customer'} ({p.customerEmail || 'N/A'})</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-neutral-600 dark:text-slate-400">{p.orderNumber || p.orderId?.orderNumber || 'N/A'}</td>
                        <td className="py-4 px-6 text-neutral-700 dark:text-slate-300 font-medium">{p.paymentMethod || p.method || 'Razorpay/UPI'}</td>
                        <td className="py-4 px-6 font-semibold text-neutral-900">INR {typeof p.amount === 'number' ? p.amount.toLocaleString() : p.amount}</td>
                        <td className="py-4 px-6 font-mono text-[10px] text-neutral-400 max-w-[140px] truncate" title={p.signature}>{p.signature || 'Verified Signature'}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold border ${
                            isSuccess
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                              : isPending
                                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                          }`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>{isSuccess ? 'SUCCESS' : isPending ? 'PENDING' : 'FAILED'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Payments;
