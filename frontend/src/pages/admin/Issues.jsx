import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  LifeBuoy, AlertCircle, Search, Trash2, ShieldCheck, CheckCircle2, 
  RefreshCw, Filter, Mail, Clock, Check, AlertTriangle, Layers
} from 'lucide-react';

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, openCount: 0, inProgressCount: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.issueType = typeFilter;

      const res = await client.get('/api/admin/issues', { params, silent: true });
      if (res.data?.success && res.data?.data) {
        setIssues(res.data.data.issues || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin customer support issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [search, statusFilter, typeFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await client.patch(`/api/admin/issues/${id}/status`, { status: newStatus });
      if (res.data?.success && res.data?.data) {
        setIssues(prev => prev.map(issue => issue._id === id ? res.data.data : issue));
      }
    } catch (err) {
      alert('Failed to update issue status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this support issue entry?')) return;
    try {
      await client.delete(`/api/admin/issues/${id}`);
      setIssues(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete issue');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200">
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Customer Support Tickets & Raised Issues</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Support Issues & Ticket Management
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Manage customer support requests, download token issues, and payment inquiries.
            </p>
          </div>

          <button
            onClick={fetchIssues}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tickets</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Tickets</span>
              <p className="text-xl sm:text-2xl font-black text-neutral-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-600 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Open Status</span>
              <p className="text-xl sm:text-2xl font-black text-red-600">{stats.openCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">In Progress</span>
              <p className="text-xl sm:text-2xl font-black text-amber-600">{stats.inProgressCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Resolved</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">{stats.resolvedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-neutral-500 font-bold px-2 uppercase tracking-wider">
            <Filter className="h-4 w-4 text-neutral-400" />
            <span>Filters</span>
          </div>

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-neutral-50 font-medium placeholder:text-neutral-400 flex-grow max-w-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-neutral-50 font-bold"
          >
            <option value="">All Statuses</option>
            <option value="open">🔴 Open</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="resolved">🟢 Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-neutral-50 font-bold"
          >
            <option value="">All Issue Types</option>
            <option value="technical">💻 Technical</option>
            <option value="billing">💰 Billing</option>
            <option value="download">📥 Download Issue</option>
            <option value="other">❓ Other</option>
          </select>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin" />
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Loading tickets...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <ShieldCheck className="h-12 w-12 text-emerald-500" />
            <span className="text-sm text-neutral-500 font-bold uppercase tracking-wider">All Clean! No active support issues.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-150 space-y-4"
              >
                {/* Header metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-neutral-900">{item.name}</span>
                      <span className="font-mono text-neutral-400 text-xs">({item.email})</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        item.issueType === 'technical'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.issueType === 'billing'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.issueType === 'download'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-neutral-50 text-neutral-700 border border-neutral-200'
                      }`}>
                        {item.issueType}
                      </span>
                    </div>
                    {item.relatedOrderId && (
                      <p className="text-xs text-neutral-400 font-medium">
                        Related Order: <span className="font-mono text-neutral-600 font-bold">#{item.relatedOrderId}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={item.status}
                      disabled={updatingId === item._id}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      className={`px-3 py-1.5 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${
                        item.status === 'open'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <option value="open">🔴 Open</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Issue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                  {item.description}
                </p>

                {/* Footer Time */}
                <div className="text-[11px] text-neutral-400 font-medium">
                  Logged on {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminIssues;
