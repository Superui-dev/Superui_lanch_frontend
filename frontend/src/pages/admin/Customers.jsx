import React, { useState, useEffect, useMemo } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Users, Ban, ShieldCheck, Mail, Calendar, Inbox, Search, RefreshCw, ShoppingBag, CreditCard } from 'lucide-react';

const Customers = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/customers');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCustomers(res.data.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      // Quiet fallback
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    
    // Instant Optimistic UI Update (<1ms)
    setCustomers(prev =>
      prev.map(c => (c._id === id ? { ...c, status: newStatus } : c))
    );

    try {
      await client.put(`/api/admin/customers/${id}/status`, { status: newStatus });
    } catch (err) {
      // Revert if request fails
      setCustomers(prev =>
        prev.map(c => (c._id === id ? { ...c, status: currentStatus } : c))
      );
      alert('Failed to update customer status');
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search filter
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = !term || (
        (c.name || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.phone || '').toLowerCase().includes(term)
      );

      // Date filter
      let matchesDate = true;
      if (selectedDate && c.createdAt) {
        const createdDate = new Date(c.createdAt).toISOString().split('T')[0];
        matchesDate = createdDate === selectedDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [customers, searchQuery, selectedDate]);

  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredCustomers, currentPage]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Registered Customers ({filteredCustomers.length})</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Audit registered users, order statistics, and account access controls.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminDatePicker label="Signup Date" />
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLight 
                  ? 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 shadow-sm' 
                  : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-slate-300'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Controls Bar: Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${colors.textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer name, email, or phone..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs ${colors.bgInput} ${colors.borderInput} ${colors.text} placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
            />
          </div>
          <div className="text-xs text-neutral-500 font-medium hidden sm:block">
            Showing <strong className="text-neutral-900 font-bold">{filteredCustomers.length}</strong> registered customer(s)
          </div>
        </div>

        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${colors.border} bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-slate-300 font-medium uppercase tracking-wider`}>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Orders / Spent</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Signed Up</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${colors.border} ${colors.textSecondary}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-500"></div>
                      <p className="text-xs text-neutral-500 mt-2 font-medium">Loading customers list...</p>
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Inbox className={`h-10 w-10 mx-auto ${colors.textMuted} mb-2`} />
                      <p className={`text-sm ${colors.textSecondary} font-medium`}>
                        {searchQuery || selectedDate ? 'No customers found matching search/date criteria' : 'No registered customers found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c) => (
                    <tr key={c._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors duration-150">
                      <td className="py-4 px-6 flex items-center space-x-3">
                        <div className={`h-9 w-9 rounded-full ${colors.accentBg} border ${colors.accentBorder} ${colors.accent} flex items-center justify-center font-semibold text-sm uppercase shrink-0`}>
                          {c.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className={`font-medium ${colors.text}`}>{c.name}</p>
                          <p className={`text-[10px] ${colors.textSecondary} flex items-center mt-0.5`}>
                            <Mail className={`h-3 w-3 mr-1 ${colors.textMuted}`} />
                            <span>{c.email}</span>
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-neutral-900 flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-brand-500" />
                            <span>{c.orderCount || 0} order(s)</span>
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold">
                            ₹{(c.totalSpent || 0).toLocaleString()} spent
                          </p>
                        </div>
                      </td>

                      <td className={`py-4 px-6 font-medium capitalize ${colors.text}`}>{c.role || 'customer'}</td>

                      <td className={`py-4 px-6 ${colors.textSecondary} font-medium`}>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                          <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                          c.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                            : 'bg-red-500/10 border-red-500/20 text-red-600'
                        }`}>
                          {c.status || 'active'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => toggleStatus(c._id, c.status || 'active')}
                          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-[10px] font-medium border transition ${
                            c.status === 'active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Ban className="h-3 w-3" />
                          <span>{c.status === 'active' ? 'Disable Account' : 'Enable Account'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Customers;
