import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Phone, ArrowRight, Clock, Monitor, Globe, Check, ExternalLink, Loader2
} from 'lucide-react';
import client from '../../api/client';
import BrandLogo from './BrandLogo';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const timeSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

const getCleanInstagramUsername = (input) => {
  if (!input) return '';
  let clean = input.trim();
  clean = clean.replace(/^@/, '');
  try {
    if (clean.includes('instagram.com/')) {
      const parts = clean.split('instagram.com/');
      if (parts[1]) {
        clean = parts[1].split('/')[0].split('?')[0];
      }
    }
  } catch (e) {}
  return clean.trim();
};

const getInitialBookingMonthAndYear = () => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (today.getDate() >= daysInMonth) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { month: nextMonth.getMonth(), year: nextMonth.getFullYear() };
  }
  return { month: today.getMonth(), year: today.getFullYear() };
};

const BookingCallModal = ({ isOpen, onClose, serviceName = '' }) => {
  const [bookingStep, setBookingStep] = useState('calendar');
  const [selectedBookDate, setSelectedBookDate] = useState('');
  const [selectedBookTime, setSelectedBookTime] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookInstagramId, setBookInstagramId] = useState('');
  const [previewInstagramId, setPreviewInstagramId] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookMessage, setBookMessage] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookMonth, setBookMonth] = useState(getInitialBookingMonthAndYear().month);
  const [bookYear, setBookYear] = useState(getInitialBookingMonthAndYear().year);

  const autoAdvancedRef = useRef(false);
  const fetchedSlotsRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setBookingStep('calendar');
      setSelectedBookDate('');
      setSelectedBookTime('');
      setBookName('');
      setBookEmail('');
      setBookInstagramId('');
      setPreviewInstagramId('');
      setBookPhone('');
      setBookMessage(serviceName ? `I'm interested in your "${String(serviceName)}" service.` : '');
      autoAdvancedRef.current = false;
      const initialData = getInitialBookingMonthAndYear();
      setBookMonth(initialData.month);
      setBookYear(initialData.year);
      fetchBookedSlots();
    }
  }, [isOpen, serviceName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewInstagramId(bookInstagramId);
    }, 800);
    return () => clearTimeout(timer);
  }, [bookInstagramId]);

  const fetchBookedSlots = async () => {
    try {
      const res = await client.get('/api/public/booked-slots', { silent: true });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBookedSlots(res.data.data);
      }
    } catch (err) {
      // Quiet fallback for booked slots
    }
  };

  const handlePrevMonth = () => {
    const initialData = getInitialBookingMonthAndYear();
    if (bookYear === initialData.year && bookMonth === initialData.month) return;
    if (bookMonth === 0) {
      setBookMonth(11);
      setBookYear(bookYear - 1);
    } else {
      setBookMonth(bookMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (bookMonth === 11) {
      setBookMonth(0);
      setBookYear(bookYear + 1);
    } else {
      setBookMonth(bookMonth + 1);
    }
  };

  const isFullyBooked = (dateStr) => {
    const slotsBookedForDate = bookedSlots.filter(b => b.date === dateStr).map(b => b.time);
    return timeSlots.every(slot => slotsBookedForDate.includes(slot));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookName || !bookEmail) {
      alert('Please enter your name and email.');
      return;
    }
    setBookingSubmitLoading(true);
    try {
      await client.post('/api/public/book-call', {
        name: bookName,
        email: bookEmail,
        instagramId: getCleanInstagramUsername(bookInstagramId),
        phone: bookPhone,
        date: selectedBookDate,
        time: selectedBookTime,
        message: bookMessage
      });
      setBookingStep('success');
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#131313] text-white rounded-3xl border border-neutral-800 w-full max-w-[950px] overflow-hidden flex flex-col md:flex-row relative max-h-[90vh] md:max-h-[640px] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900/50 hover:bg-neutral-800/80 z-20 transition-all"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Left Column: Details (32% width) */}
        <div className="w-full md:w-[32%] p-6 md:p-8 border-b md:border-b-0 md:border-r border-neutral-800 space-y-6 shrink-0 bg-[#0A0A0A] text-left">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8" hideText />
            <span className="text-white font-extrabold text-sm tracking-tight">SuperUI</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">Project Discovery Call</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Book a free 30-minute call to discuss your project. We'll cover your goals, audience, and needs so we can give you a clear plan and timeline.
            </p>
          </div>

          <div className="space-y-3.5 pt-4 border-t border-neutral-800 text-neutral-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              <span>30m</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-neutral-500" />
              <span>Voice Call</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neutral-500" />
              <span>Telangana, India</span>
            </div>
          </div>
        </div>

        {/* Right Side: Custom Booker System */}
        <div className="flex-grow p-6 md:p-8 md:pt-12 md:pr-14 bg-[#131313] overflow-y-auto min-h-0 text-left relative flex flex-col justify-start items-stretch">
          {bookingStep === 'calendar' && (
            <div className="space-y-6 flex flex-col justify-between flex-grow">
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-500 mb-2">
                  1. Select Date & Time
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Left: Calendar grid */}
                  <div className="border border-neutral-800 p-5 rounded-2xl bg-neutral-950/40">
                    {/* Month navigation header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={bookYear === getInitialBookingMonthAndYear().year && bookMonth === getInitialBookingMonthAndYear().month}
                        className="p-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        &lt;
                      </button>
                      <span className="text-xs font-extrabold text-white tracking-wide">
                        {monthNames[bookMonth]} {bookYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 px-2.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                      >
                        &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-extrabold text-neutral-500 mb-2">
                      {daysOfWeek.map(day => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {(() => {
                        const daysInMonth = new Date(bookYear, bookMonth + 1, 0).getDate();
                        const firstDayIndex = new Date(bookYear, bookMonth, 1).getDay();
                        const prevMonthDays = new Date(bookYear, bookMonth, 0).getDate();

                        const cells = [];
                        
                        for (let i = firstDayIndex - 1; i >= 0; i--) {
                          const d = prevMonthDays - i;
                          cells.push(
                            <div
                              key={`prev-${d}`}
                              className="aspect-square text-xs font-bold rounded-xl flex items-center justify-center text-neutral-750 opacity-20 cursor-not-allowed"
                            >
                              {d}
                            </div>
                          );
                        }

                        for (let d = 1; d <= daysInMonth; d++) {
                          const dateStr = `${bookYear}-${String(bookMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const dateToCheck = new Date(bookYear, bookMonth, d);
                          const todayVal = new Date();
                          todayVal.setHours(0, 0, 0, 0);
                          
                          const isSelectable = dateToCheck > todayVal && !isFullyBooked(dateStr);
                          const isSelected = selectedBookDate === dateStr;

                          cells.push(
                            <button
                              key={`day-${d}`}
                              type="button"
                              disabled={!isSelectable}
                              onClick={() => {
                                setSelectedBookDate(dateStr);
                                setSelectedBookTime('');
                              }}
                              className={`aspect-square text-xs font-bold rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                                  : isSelectable
                                  ? 'bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white cursor-pointer'
                                  : 'bg-transparent text-neutral-750 opacity-20 cursor-not-allowed'
                              }`}
                            >
                              {d}
                            </button>
                          );
                        }

                        const totalRendered = cells.length;
                        const nextMonthNeeded = 42 - totalRendered;
                        for (let d = 1; d <= nextMonthNeeded; d++) {
                          cells.push(
                            <div
                              key={`next-${d}`}
                              className="aspect-square text-xs font-bold rounded-xl flex items-center justify-center text-neutral-750 opacity-20 cursor-not-allowed"
                            >
                              {d}
                            </div>
                          );
                        }

                        return cells;
                      })()}
                    </div>
                  </div>

                  {/* Right: Time Slots */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                      Available Slots {selectedBookDate ? `for ${selectedBookDate}` : ''}
                    </h5>
                    
                    {!selectedBookDate ? (
                      <div className="h-full flex items-center justify-center p-8 border border-dashed border-neutral-800 rounded-2xl text-center text-xs text-neutral-500">
                        Please select a date from the calendar first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                        {timeSlots.map(slot => {
                          const isSelected = selectedBookTime === slot;
                          const isBooked = bookedSlots.some(b => b.date === selectedBookDate && b.time === slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedBookTime(slot)}
                              className={`py-2 px-3 text-[11px] font-bold rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/10 cursor-pointer'
                                  : isBooked
                                  ? 'bg-neutral-950/40 text-neutral-650 border-neutral-900 line-through opacity-25 cursor-not-allowed'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white cursor-pointer'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedBookDate || !selectedBookTime}
                onClick={() => setBookingStep('form')}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-4"
              >
                Next: Enter Details
              </button>
            </div>
          )}

          {bookingStep === 'form' && (
            <form onSubmit={handleBookingSubmit} className="space-y-5 flex flex-col justify-between flex-grow">
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-500">
                  2. Enter Booking Details
                </h4>
                
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs space-y-1">
                  <p className="text-neutral-400 font-semibold">Selected Session Time:</p>
                  <p className="text-white font-extrabold text-xs">
                    {new Date(selectedBookDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {selectedBookTime} (IST)
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-left">
                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={bookEmail}
                      onChange={(e) => setBookEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Instagram ID</label>
                    <input
                      type="text"
                      value={bookInstagramId}
                      onChange={(e) => setBookInstagramId(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                    />
                    {getCleanInstagramUsername(previewInstagramId) && (
                      <div className="mt-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2 animate-fade-in text-left">
                        <div className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1.5">
                          <span>Verify Link:</span>
                          <a
                            href={`https://instagram.com/${getCleanInstagramUsername(previewInstagramId)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-400 hover:underline flex items-center gap-0.5 transition-colors font-bold"
                          >
                            instagram.com/{getCleanInstagramUsername(previewInstagramId)}
                            <ExternalLink className="h-2.5 w-2.5 inline" />
                          </a>
                        </div>
                        <div className="text-[10px] text-brand-500 font-extrabold leading-relaxed border-t border-neutral-900 pt-1.5 flex items-start gap-1">
                          <span>⚠️</span>
                          <span>Please enter your correct Instagram ID. Our team will call/contact you on Instagram only.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Main Cell Number</label>
                    <input
                      type="tel"
                      required
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1.5 uppercase text-[9px]">Message / Requirements (Optional)</label>
                    <textarea
                      rows={3}
                      value={bookMessage}
                      onChange={(e) => setBookMessage(e.target.value)}
                      placeholder="Brief description of what you'd like to cover..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-neutral-650 focus:outline-none focus:border-brand-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setBookingStep('calendar')}
                  className="py-3 px-6 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitLoading}
                  className="flex-grow py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-all disabled:opacity-50"
                >
                  {bookingSubmitLoading ? 'Scheduling...' : 'Confirm Call Booking'}
                </button>
              </div>
            </form>
          )}

          {bookingStep === 'success' && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 flex-grow">
              <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Call Booking Confirmed!</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                  We have scheduled your 30-minute discovery call and sent a Google Meet invitation link to <b>{bookEmail}</b>.
                </p>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs text-left w-full max-w-sm space-y-1">
                <p className="text-neutral-400 font-semibold">Scheduled Date & Time:</p>
                <p className="text-white font-extrabold text-xs">
                  {new Date(selectedBookDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {selectedBookTime} (IST)
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-bold transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCallModal;
