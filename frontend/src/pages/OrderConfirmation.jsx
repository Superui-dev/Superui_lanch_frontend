import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Download, Mail, Heart, Star, 
  Printer, Loader2 
} from 'lucide-react';
import client from '../api/client';
import CustomerFeedbackModal from '../components/common/CustomerFeedbackModal';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/orders/${id}`, { silent: true });
        if (res.data?.success && res.data.data) {
          setOrderData(res.data.data);
        } else {
          throw new Error('Not found');
        }
      } catch (err) {
        // Fallback to simulated local details
        const simulatedTotal = localStorage.getItem('checkout_total') || '99.99';
        const simulatedName = localStorage.getItem('checkout_name') || 'Usman Shams';
        const simulatedEmail = localStorage.getItem('checkout_email') || 'hello.superui@gmail.com';
        const simulatedPhone = localStorage.getItem('checkout_phone') || '+91 98765 43210';
        
        setOrderData({
          order: {
            _id: id || 'ord_demo_ref',
            orderNumber: id || 'ord_' + Math.random().toString(36).substr(2, 9),
            totalAmount: Number(simulatedTotal),
            orderStatus: 'PAID',
            customerSnapshot: {
              name: simulatedName,
              email: simulatedEmail,
              phone: simulatedPhone
            },
            createdAt: new Date().toISOString()
          },
          items: [
            {
              productId: { name: 'Premium Design Kit UI Asset' },
              price: Number(simulatedTotal),
              quantity: 1
            }
          ]
        });
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    loadOrder();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} • ${time}`;
  };

  const formatAmount = (amt) => {
    return typeof amt === 'number' ? `₹${amt.toLocaleString('en-IN')}` : '₹99.00';
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'PAID':
      case 'SUCCESS':
        return {
          title: 'Thank you!',
          subtitle: 'Your ticket has been issued successfully',
          lightClass: 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          badge: (
            <span className="inline-block mt-0.5 px-2.5 py-0.5 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-250 rounded-full">
              Confirmed
            </span>
          ),
          icon: '🎫',
          colorTheme: 'text-neutral-900'
        };
      case 'PENDING':
        return {
          title: 'Payment Pending',
          subtitle: 'Your transaction is currently processing',
          lightClass: 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse',
          badge: (
            <span className="inline-block mt-0.5 px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-250 rounded-full animate-pulse">
              Pending
            </span>
          ),
          icon: '⏳',
          colorTheme: 'text-amber-600'
        };
      default:
        return {
          title: 'Payment Failed',
          subtitle: 'There was an issue processing your order',
          lightClass: 'bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-bounce',
          badge: (
            <span className="inline-block mt-0.5 px-2.5 py-0.5 text-[9px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-250 rounded-full">
              Failed
            </span>
          ),
          icon: '❌',
          colorTheme: 'text-rose-600'
        };
    }
  };

  const statusInfo = getStatusDetails(orderData?.order?.orderStatus || 'PAID');

  return (
    <div className="max-w-lg mx-auto my-16 sm:my-24 p-6 sm:p-8 rounded-3xl bg-[#fafafa] border border-neutral-200 shadow-xl text-center space-y-6">
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
          <p className="text-xs font-black text-neutral-500 uppercase tracking-widest animate-pulse">
            Connecting to receipt printer...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
              {orderData?.order?.orderStatus === 'PAID' ? 'Payment Confirmed!' : orderData?.order?.orderStatus === 'PENDING' ? 'Order Processing' : 'Payment Error'}
            </h1>
            <p className="text-xs text-neutral-500 font-bold">
              {orderData?.order?.orderStatus === 'PAID' ? 'Your order receipt slip has been issued successfully.' : 'Please view your current receipt status below.'}
            </p>
          </div>

          {/* Receipt Printer Machine & Animated Slip */}
          <div className="py-2">
            {/* Golden metallic printer head */}
            <div id="printer-head" className="relative w-full max-w-[360px] mx-auto h-9 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-t-2xl border border-amber-600 shadow-md">
              {/* Blinking/Glowing status light */}
              <div className={`absolute right-5 top-3.5 h-2 w-2 rounded-full border transition-all ${statusInfo.lightClass}`}></div>
              {/* Slit design elements */}
              <div className="absolute left-5 top-3 h-2.5 w-16 bg-amber-950/40 rounded-full"></div>
            </div>
            {/* Printer slot exit slit */}
            <div id="printer-slit" className="w-full max-w-[360px] mx-auto h-2 bg-[#0e0e0e] rounded-b-md relative z-10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.8)]"></div>
            
            {/* Sliding Ticket Receipt Paper */}
            <div 
              id="receipt-print-area" 
              className="animate-print-slip w-full max-w-[360px] mx-auto bg-[#ffffff] text-left border-x border-b border-neutral-200 shadow-xl rounded-b-2xl p-6 relative overflow-hidden select-none"
            >
              {/* CSS style wrapper for print slip animations */}
              <style>{`
                @keyframes printSlip {
                  0% {
                    max-height: 0px;
                    opacity: 0;
                    transform: translateY(-25px) scaleY(0);
                    transform-origin: top;
                  }
                  100% {
                    max-height: 700px;
                    opacity: 1;
                    transform: translateY(0) scaleY(1);
                    transform-origin: top;
                  }
                }
                .animate-print-slip {
                  animation: printSlip 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #receipt-print-area, #receipt-print-area * {
                    visibility: visible;
                  }
                  #receipt-print-area {
                    position: absolute;
                    left: 50%;
                    top: 40px;
                    transform: translateX(-50%) !important;
                    width: 100%;
                    max-width: 380px;
                    box-shadow: none !important;
                    border: 1px solid #ccc !important;
                    background: white !important;
                    color: black !important;
                    padding: 24px !important;
                  }
                  #receipt-print-actions, #printer-head, #printer-slit {
                    display: none !important;
                  }
                }
              `}</style>

              {/* Receipt Header Icon */}
              <div className="flex justify-center mb-3">
                <div className="h-10 w-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center shadow-sm">
                  <span className="font-extrabold text-lg">{statusInfo.icon}</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className={`text-base font-black leading-tight ${statusInfo.colorTheme}`}>{statusInfo.title}</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                  {statusInfo.subtitle}
                </p>
              </div>

              {/* Punch-hole Cutouts & Dashed Cutting Line */}
              <div className="relative border-t border-dashed border-neutral-200 my-5">
                <div className="absolute -left-8 -top-2 h-4 w-4 rounded-full bg-[#fafafa] border-r border-neutral-200"></div>
                <div className="absolute -right-8 -top-2 h-4 w-4 rounded-full bg-[#fafafa] border-l border-neutral-200"></div>
              </div>

              {/* Order Metadata Table Grid */}
              <div className="grid grid-cols-2 gap-y-4 text-xs">
                <div>
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide">Ticket ID</p>
                  <p className="font-extrabold text-neutral-900 truncate pr-2" title={orderData?.order?.orderNumber}>
                    {orderData?.order?.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide">Amount</p>
                  <p className="font-black text-neutral-900 text-sm">
                    {formatAmount(orderData?.order?.totalAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide">Date & Time</p>
                  <p className="font-bold text-neutral-950">
                    {formatDate(orderData?.order?.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wide">Status</p>
                  {statusInfo.badge}
                </div>
              </div>

              {/* Payment Method / Customer Info Box */}
              <div className="mt-5 p-3.5 bg-neutral-50 border border-neutral-150 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Two overlapping Mastercard circles */}
                  <div className="flex -space-x-1.5 items-center shrink-0">
                    <div className="h-4 w-4 rounded-full bg-[#eb001b]"></div>
                    <div className="h-4 w-4 rounded-full bg-[#ff5f00] opacity-85"></div>
                  </div>
                  <div className="text-[10px] text-left">
                    <p className="font-extrabold text-neutral-800">
                      {orderData?.order?.customerSnapshot?.name || 'Usman Shams'}
                    </p>
                    <p className="text-neutral-400 font-bold font-mono">•••• 8237</p>
                  </div>
                </div>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider">
                  {orderData?.order?.orderStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                </span>
              </div>

              {/* Dynamic Pure-CSS Barcode block */}
              <div className="flex justify-center items-center gap-[2.5px] h-10 px-3 mt-6 opacity-80">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 3, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2].map((w, i) => (
                  <div key={i} className="bg-neutral-800 h-full shrink-0" style={{ width: `${w}px` }}></div>
                ))}
              </div>
              <p className="text-[7.5px] tracking-[4px] font-mono text-neutral-500 text-center mt-1.5 mr-[-4px]">
                2 8937261 273618
              </p>
            </div>

            {/* Print Slip Action Button */}
            <div id="receipt-print-actions" className="flex justify-center mt-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-[11px] font-bold transition-all border border-neutral-250 cursor-pointer shadow-sm hover:shadow"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Payment Slip</span>
              </button>
            </div>
          </div>

          {orderData?.order?.orderStatus === 'PAID' && (
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 text-left space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-start space-x-3 text-xs">
                <Mail className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900">Check Your Inbox</p>
                  <p className="text-neutral-500 font-medium leading-relaxed">
                    A download link has been sent to your email address: <span className="font-bold text-neutral-800">{orderData?.order?.customerSnapshot?.email}</span>.
                  </p>
                </div>
              </div>
              
               <div className="flex items-start space-x-3 text-xs border-t border-neutral-100 pt-3.5">
                 <Download className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                 <div>
                   <p className="font-bold text-neutral-900">Instant Purchase Link</p>
                   <p className="text-neutral-500 font-medium leading-relaxed">Access your digital asset files directly from the secure download link in your email, or from your account order history.</p>
                   <Link to="/account/orders" className="text-brand-600 hover:text-brand-700 font-bold mt-1.5 inline-flex items-center gap-1">
                     <span>View My Orders</span>
                     <ArrowRight className="h-3.5 w-3.5" />
                   </Link>
                 </div>
               </div>
            </div>
          )}

          {/* Leave Feedback Banner Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-orange-50 to-amber-50 border border-brand-200/80 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
              </div>
              <p className="text-xs font-bold text-neutral-900">How was your checkout experience?</p>
              <p className="text-[11px] text-neutral-500">Leave your quick feedback for our engineering team.</p>
            </div>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>Leave Feedback</span>
            </button>
          </div>

          <div className="pt-2 flex gap-3">
            <Link 
              to="/products"
              className="w-full py-3.5 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 transition shadow-sm text-center"
            >
              Browse Marketplace
            </Link>
            <Link 
              to="/account/orders"
              className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-xs font-bold text-white shadow-md transition text-center"
            >
              View My Orders
            </Link>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        orderId={id}
      />
    </div>
  );
};

export default OrderConfirmation;
