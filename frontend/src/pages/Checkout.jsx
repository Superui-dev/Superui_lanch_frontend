import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CreditCard, Trash2, ArrowRight, ShieldCheck, Mail, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, cartSubtotal, clearCart, removeFromCart } = useCart();
  const { user, updateCustomerProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [confirmEmail, setConfirmEmail] = useState(user?.email || '');
  
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) {
        setEmail(user.email);
        setConfirmEmail(user.email);
      }
    }
  }, [user]);

  const emailMatch = email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }
    if (!name || !email || !confirmEmail || !phone) {
      setCheckoutError('Please fill in all customer details (Name, Cell Number, Email Address, Confirm Email).');
      return;
    }
    if (!emailMatch) {
      setCheckoutError('Email Address and Confirm Email Address do not match. Please verify your email before proceeding.');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      // Step 1: Update customer profile locally
      if (updateCustomerProfile) {
        updateCustomerProfile({ name, email, phone });
      }

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      // Step 3: Create Order on Backend
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item._id || item.productId,
          quantity: item.quantity || 1
        })),
        customerEmail: email,
        customerName: name,
        customerPhone: phone
      };

      const res = await client.post('/api/payments/create-order', orderPayload);
      if (!res.data?.success || !res.data.data) {
        throw new Error(res.data?.message || 'Failed to initialize payment transaction.');
      }

      const { gatewayOrderId, amount, keyId, orderId } = res.data.data;

      // Step 4: Configure Razorpay Modal Options
      if (!keyId) {
        throw new Error('Payment gateway is not configured. Please contact support.');
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'SuperUI Store',
        description: 'Purchase Premium Digital Assets - No Refunds',
        order_id: gatewayOrderId,
        handler: async (response) => {
          try {
            setCheckoutLoading(true);
            // Verify payment on backend
            const verifyRes = await client.post('/api/payments/verify', {
              orderId: orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyRes.data?.success) {
              localStorage.setItem('checkout_total', cartTotal.toString());
              localStorage.setItem('checkout_name', name);
              localStorage.setItem('checkout_email', email);
              localStorage.setItem('checkout_phone', phone);
              clearCart();
              navigate(`/order/confirmation/${orderId}`);
            } else {
              throw new Error(verifyRes.data?.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setCheckoutError(verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed.');
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#2563eb' // matches brand-600 color
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setCheckoutLoading(false);
        setCheckoutError(
          response?.error?.description ||
          'Payment failed. Please try again or use a different payment method.'
        );
      });

      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(err.response?.data?.message || err.message || 'Checkout failed to initialize. Please try again.');
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-white border border-neutral-200 shadow-xl text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <CreditCard className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Your Cart is Empty</h2>
        <p className="text-neutral-500 text-xs leading-relaxed">
          Explore our collection of premium templates, e-books, and developer UI assets.
        </p>
        <button 
          type="button"
          onClick={() => navigate('/products')}
          className="px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white font-bold text-xs shadow-lg transition-all"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 text-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pre-Payment Customer Details</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Please verify your contact details & 2-type email confirmation before executing Razorpay payment.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Billing Details Form */}
        <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-6 bg-white border border-neutral-200/90 p-8 rounded-3xl shadow-lg">
          <h2 className="text-base font-bold text-neutral-900 flex items-center space-x-2 border-b border-neutral-100 pb-4">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <span>Customer Information & Verification</span>
          </h2>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>All purchases are final. No refunds or exchanges on digital products. Please verify your details carefully before proceeding.</span>
          </div>

          {checkoutError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Cell / Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* 2-TYPE EMAIL CONFIRMATION CHECK */}
          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-600" />
                <span>2-Type Email Confirmation Check</span>
              </span>
              <span className="text-[10px] text-neutral-500">Prevents delivery email typos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  1. Primary Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:outline-none focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  2. Confirm Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Re-type customer@example.com"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-neutral-900 text-xs focus:outline-none transition ${
                    confirmEmail && !emailMatch
                      ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                      : 'border-neutral-300 focus:border-brand-600'
                  }`}
                />
              </div>
            </div>

            {/* Live Email Confirmation Status */}
            {email && confirmEmail && (
              <div className="pt-1">
                {emailMatch ? (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Email addresses match! Direct download token will be sent to {email}.</span>
                  </p>
                ) : (
                  <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Email addresses do not match. Please verify before proceeding.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="flex items-center text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 mr-1.5" />
              <span>Direct instant download upon successful payment</span>
            </span>

            {/* Main Action Button: padding 16px 32px (px-8 py-4) and rounded-2xl */}
            <button 
              type="submit"
              disabled={checkoutLoading || !emailMatch}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-xs font-bold text-white shadow-xl hover:shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              <span>{checkoutLoading ? 'Processing...' : 'Proceed to Razorpay Payment'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Side: Order Summary & Coupons */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Summary box */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">Order Summary</h2>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition hover:underline"
              >
                + Add Products
              </button>
            </div>
            
            {/* Cart products */}
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-neutral-500 font-medium">Your order list is empty.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 transition"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item._id || item.productId} className="flex justify-between items-center text-xs group">
                    <div className="flex items-center gap-2">
                      {item.image || item.thumbnail?.url ? (
                        <img src={item.image || item.thumbnail?.url} alt="" className="h-8 w-8 rounded-lg object-cover bg-neutral-100" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : null}
                      <span className="text-neutral-800 font-semibold line-clamp-1 max-w-[160px] sm:max-w-[180px]">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-900 font-extrabold whitespace-nowrap">₹{(item.price || item.sellingPrice)?.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id || item.productId)}
                        className="text-neutral-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50"
                        title="Remove product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations details */}
            <div className="pt-4 border-t border-neutral-100 space-y-2.5">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-800">₹{cartSubtotal?.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-3 border-t border-neutral-100">
                <span>Total Amount</span>
                <span className="text-brand-600">₹{cartTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 leading-relaxed shadow-sm">
            All purchases are final. No refunds or exchanges on digital products. Please verify your details carefully before proceeding.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
