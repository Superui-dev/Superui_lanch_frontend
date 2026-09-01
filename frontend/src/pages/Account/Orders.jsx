import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import AccountSecurityModal from '../../components/common/AccountSecurityModal';
import { Package, Receipt, FileText, Download, Calendar, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await client.get('/api/orders/my-orders');
        if (res.data?.success && res.data?.data) {
          setOrders(res.data.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <AccountSecurityModal 
        isOpen={securityModalOpen} 
        onClose={() => setSecurityModalOpen(false)} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Purchase History</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage your licenses, review transactions, and access downloadable files.</p>
        </div>

        <button
          onClick={() => setSecurityModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-200 transition shadow-lg shrink-0"
        >
          <KeyRound className="h-4 w-4 text-indigo-400" />
          <span>Password & Security</span>
        </button>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-brand-900/10 border border-brand-900/40 space-y-4">
            <Package className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-white font-semibold">No Purchases Logged</h3>
            <p className="text-slate-400 text-xs">Once you purchase a template, it will populate here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order._id} 
              className="rounded-2xl bg-brand-900/15 border border-brand-900/60 overflow-hidden"
            >
              {/* Heading status panel */}
              <div className="p-5 bg-brand-900/40 border-b border-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">Order Reference</p>
                    <span className="text-white font-bold font-mono">{order.orderNumber}</span>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">Purchase Date</p>
                    <span className="text-slate-300 font-medium flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">Total Charge</p>
                    <span className="text-white font-extrabold">INR {order.totalAmount}</span>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/20">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items checklist */}
              <div className="p-5 divide-y divide-brand-900/40">
                {order.items?.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-brand-900 border border-brand-850 text-brand-400 rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{item.productName}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">Single-Developer License</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Signed direct downloader */}
                      <a 
                        href={`/download/${item.tokenValue || 'demo-token'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-xs font-bold text-white shadow-glow transition"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Files</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;

