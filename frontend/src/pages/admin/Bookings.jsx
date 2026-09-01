import React, { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import {
  Phone, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, ShieldCheck, Loader2
} from 'lucide-react';

const Bookings = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('day');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (viewMode === '5day') params.set('view', '5day');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (selectedDateStr) params.set('date', selectedDateStr);
      const res = await client.get(`/api/admin/bookings?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBookings(res.data.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn('Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [viewMode, statusFilter, selectedDateStr]);

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.message?.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const paginatedBookings = useMemo(() => {
    return filteredBookings.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredBookings, currentPage]);

  const dateRangeLabel = useMemo(() => {
    if (viewMode === '5day') {
      const today = new Date();
      const end = new Date(today);
      end.setDate(today.getDate() + 4);
      return `${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return selectedDateStr
      ? new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : 'All Dates';
  }, [viewMode, selectedDateStr]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const scheduled = bookings.filter(b => b.status === 'scheduled').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const verified = bookings.filter(b => b.callVerified).length;
    return { total, scheduled, completed, verified };
  }, [bookings]);

  const handleVerifyCall = async (e) => {
    e.preventDefault();
    if (!activeBooking || !verifyCode.trim()) return;
    setVerifying(true);
    try {
      const res = await client.put(`/api/admin/bookings/${activeBooking._id}/verify-call`, {
        verificationCode: verifyCode,
        notes: verifyNotes
      });
      if (res.data?.success) {
        setBookings(prev => prev.map(b =>
          b._id === activeBooking._id ? { ...b, ...res.data.data } : b
        ));
        setActiveBooking(null);
        setVerifyCode('');
        setVerifyNotes('');
      }
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await client.put(`/api/admin/bookings/${id}/status`, { status });
      if (res.data?.success) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      }
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadge = (status, callVerified) => {
    if (status === 'completed' && callVerified) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
    if (status === 'completed') {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }
    if (status === 'cancelled') {
      return 'bg-red-50 border-red-200 text-red-700';
    }
    return 'bg-amber-50 border-amber-200 text-amber-700';
  };

  const shiftDay = (direction) => {
    if (!selectedDateStr) {
      const today = new Date();
      today.setDate(today.getDate() + direction);
      setSelectedDateStr(today.toISOString().split('T')[0]);
      return;
    }
    const d = new Date(selectedDateStr + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text} flex items-center space-x-2`}>
              <Phone className="h-6 w-6 text-brand-500" />
              <span>Booking Calls Management</span>
            </h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>
              Manage scheduled calls, verify attendance, and track completion status — {dateRangeLabel}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <AdminDatePicker label="Select Date" />
            <button
              onClick={fetchBookings}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Bookings', value: stats.total, icon: Phone, color: 'bg-brand-50 text-brand-600' },
            { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
            { label: 'Call Verified', value: stats.verified, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.textSecondary}`}>{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Controls */}
        <section className={`p-5 rounded-2xl border ${colors.cardBorder} ${colors.cardBg} shadow-sm`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 text-xs font-medium transition-all ${
                    viewMode === 'day'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode('5day')}
                  className={`px-4 py-2 text-xs font-medium transition-all ${
                    viewMode === '5day'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  5-Day View
                </button>
              </div>

              {viewMode === 'day' && selectedDateStr && (
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => shiftDay(-1)} className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <ChevronLeft className="h-4 w-4 text-neutral-500" />
                  </button>
                  <span className="text-xs font-medium text-neutral-600 min-w-[140px] text-center">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button type="button" onClick={() => shiftDay(1)} className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <ChevronRight className="h-4 w-4 text-neutral-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className={`w-full sm:w-64 pl-9 pr-4 py-2 text-xs rounded-xl border ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-xl border text-xs font-medium ${colors.borderInput} ${colors.bgInput} ${colors.text} focus:outline-none cursor-pointer`}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        {/* Bookings Table */}
        <section className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? 'border-neutral-200' : 'border-neutral-800'} bg-neutral-50 dark:bg-neutral-900 text-neutral-500 uppercase tracking-wider font-bold`}>
                  <th className="py-4 px-5">Client</th>
                  <th className="py-4 px-5">Contact</th>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Message</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Call Verified</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-neutral-100' : 'divide-neutral-800/60'}`}>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i}><td colSpan={7} className="py-6"><div className="h-5 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-lg" /></td></tr>
                  ))
                ) : paginatedBookings.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-neutral-400 text-xs font-medium">No bookings found for this filter.</td></tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr key={booking._id} className={`${isLight ? 'hover:bg-neutral-50/60' : 'hover:bg-neutral-900/20'} transition-colors`}>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 dark:text-white text-xs">{booking.name}</span>
                          {booking.instagramId && <span className="text-[10px] text-neutral-400">@{booking.instagramId}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-neutral-700 dark:text-neutral-200">{booking.email}</span>
                          <span className="text-neutral-400">{booking.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-medium text-neutral-700 dark:text-neutral-200">{new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-neutral-400">{booking.time}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 max-w-[200px]">
                        <p className="text-[11px] text-neutral-500 line-clamp-2">{booking.message || 'No message'}</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(booking.status, booking.callVerified)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {booking.callVerified ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 text-[10px] font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[10px] font-medium">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {booking.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Mark Complete"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setActiveBooking(booking); setVerifyCode(''); setVerifyNotes(''); }}
                            className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                            title="Verify Call"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </section>

        {/* Call Verification Modal */}
        {activeBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-3xl p-6 lg:p-8 border shadow-2xl max-h-[90vh] overflow-y-auto ${isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Call Verification</h2>
                    <p className="text-xs text-neutral-500">{activeBooking.name} — {activeBooking.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveBooking(null)} className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 transition-colors">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyCall} className="mt-6 space-y-5">
                <div className={`p-4 rounded-xl ${isLight ? 'bg-neutral-50' : 'bg-neutral-950'} border ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
                  <div className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-slate-300 mb-2">
                    <CalendarIcon className="h-3.5 w-3.5 text-brand-500" />
                    <span className="font-medium">
                      {new Date(activeBooking.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {activeBooking.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{activeBooking.message || 'No message provided'}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300">Verification Code (min 4 chars)</label>
                  <input
                    type="text"
                    required
                    minLength={4}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter call verification code"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-slate-300">Admin Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Add notes about this call..."
                    className={`w-full px-4 py-3 rounded-xl border text-xs ${colors.borderInput} ${colors.bgInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} resize-none`}
                  />
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    Double verification required. Enter a unique code to confirm the call was completed. This will mark the booking as completed.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifying || verifyCode.length < 4}
                  className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verify & Complete Call</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Bookings;
