import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ShoppingBag, X } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Global audio helper to trigger a soft notification tap chime
const playSoftChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a gentle two-note ascending arpeggio (C5 -> E5) using a sine wave
    const playNote = (delay, freq, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    playNote(0, 523.25, 0.45); // C5
    playNote(0.12, 659.25, 0.6); // E5
  } catch (err) {}
};

const OrderPurchaseNotifier = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [visible, setVisible] = useState(false);
  const queueRef = useRef([]);
  const activeRef = useRef(false);

  useEffect(() => {
    // Connect to the public/root namespace of the Socket.io server
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      autoConnect: true
    });

    socket.on('connect_error', () => {
      // Quietly handle connection errors
    });

    socket.on('storefront:new-order', (orderData) => {
      if (orderData) {
        // Enqueue the incoming order notification payload
        queueRef.current.push(orderData);
        processQueue();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const processQueue = () => {
    if (activeRef.current || queueRef.current.length === 0) return;

    activeRef.current = true;
    const nextOrder = queueRef.current.shift();
    setCurrentOrder(nextOrder);
    setVisible(true);
    playSoftChime();

    // Show the notification for 6 seconds, then hide it
    setTimeout(() => {
      setVisible(false);
      
      // Allow fade-out animation (500ms) plus a short cooldown (1 second) before showing the next one
      setTimeout(() => {
        setCurrentOrder(null);
        activeRef.current = false;
        processQueue();
      }, 1500);
    }, 6000);
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setCurrentOrder(null);
      activeRef.current = false;
      processQueue();
    }, 500);
  };

  if (!currentOrder) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-sm w-full sm:w-[340px] bg-[#131313] border border-neutral-800 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3.5 transition-all duration-500 ease-out select-none transform text-left ${
        visible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      {/* Icon wrapper */}
      <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 shrink-0">
        <ShoppingBag className="h-5 w-5 animate-pulse" />
      </div>

      {/* Details layout */}
      <div className="flex-1 space-y-1 pr-4 min-w-0">
        <h4 className="text-[10px] text-brand-500 font-extrabold uppercase tracking-wider">
          New Purchase Live
        </h4>
        <p className="text-xs font-semibold text-neutral-400">
          <span className="text-white font-extrabold">{currentOrder.customerName || 'Customer'}</span>
          {" just ordered"}
        </p>
        <p className="text-xs font-bold text-white truncate" title={currentOrder.productName}>
          {currentOrder.productName || 'Digital Asset'}
        </p>
        <p className="text-[10px] font-extrabold text-neutral-500">
          Total amount paid: <span className="text-brand-500">INR {currentOrder.totalAmount || 0}</span>
        </p>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="p-1 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default OrderPurchaseNotifier;
