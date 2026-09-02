import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { 
  Mail, MessageSquare, Send, Sparkles, ShieldCheck, Zap, 
  Copy, Check, Clock, PhoneCall, HelpCircle, ChevronDown, ChevronUp, Globe, Instagram
} from 'lucide-react';

const contactFaqs = [
  {
    question: 'How quickly do I get digital download access after payment?',
    answer: 'Instantly! As soon as Razorpay confirms your checkout, you receive on-screen download links and an encrypted token sent straight to your email inbox.'
  },
  {
    question: 'Can I request custom UI components or template tweaks?',
    answer: 'Yes! Select "Custom Order / Enterprise" in the contact subject dropdown, and our senior engineers will assist with your bespoke project requirements.'
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a 7-day money-back guarantee if you experience technical issues that our support engineering team cannot resolve.'
  }
];

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hello.superui@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/api/contact', { name, email, phone, subject, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-neutral-900 selection:bg-brand-500 selection:text-white font-sans antialiased">
      
      {/* HERO BANNER SECTION */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 overflow-hidden border-b border-neutral-200/80 bg-white">
        
        {/* Subtle Background Radial Grid */}
        <div className="absolute inset-0 bg-hero-grid pointer-events-none opacity-40 z-0" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-gradient-to-r from-orange-500/15 via-brand-500/20 to-purple-500/15 blur-[140px] rounded-full pointer-events-none z-0" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            <span>24/7 Priority Engineer Support Desk</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Let's Build Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500">Extraordinary</span> Together
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Have questions about digital licenses, custom enterprise releases, or download tokens? Our senior engineering team responds within 2 hours.
          </p>
        </div>
      </section>

      {/* MAIN TWO COLUMN CONTACT SECTION */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
            
            {/* LEFT COLUMN: CONTACT CARDS & FAQS */}
            <div className="lg:col-span-5 space-y-8">
              
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Direct Touchpoints</h2>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1">Connect With Us</h3>
              </div>

              {/* Contact Method 1: Email */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:border-neutral-300 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">Email Support Desk</h4>
                      <p className="text-xs text-neutral-400 font-medium">Average response: &lt; 2 Hours</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <a
                  href="mailto:hello.superui@gmail.com"
                  className="block text-sm font-bold text-neutral-800 hover:text-brand-600 transition-colors pt-1"
                >
                  hello.superui@gmail.com
                </a>
              </div>

              {/* Contact Method 2: Instagram */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:border-neutral-300 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-pink-50 text-pink-600">
                      <Instagram className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">Instagram</h4>
                      <p className="text-xs text-neutral-400 font-medium">Follow & Message Directly</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-pink-100 text-pink-700 text-[10px] font-bold">FOLLOW</span>
                </div>

                <a
                  href="https://instagram.com/superui.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <span>@superui.in</span>
                  <Globe className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* FAQ Accordion Box */}
              <div className="pt-6 border-t border-neutral-200 space-y-4">
                <h4 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-brand-600" />
                  <span>Frequently Asked Questions</span>
                </h4>

                <div className="space-y-3">
                  {contactFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-4 text-left font-bold text-neutral-900 flex items-center justify-between text-xs sm:text-sm"
                      >
                        <span>{faq.question}</span>
                        {openFaq === idx ? (
                          <ChevronUp className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        )}
                      </button>
                      {openFaq === idx && (
                        <div className="px-4 pb-4 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3 bg-neutral-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PRO FLOATING CONTACT FORM */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/90 shadow-xl relative overflow-hidden">
                
                {/* Form Top Header */}
                <div className="mb-8 space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">Send Us a Message</h3>
                  <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                    Fill out your query details below. All fields marked with * are required.
                  </p>
                </div>

                {success ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-200">
                        <ShieldCheck className="h-10 w-10" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-neutral-900">Message Delivered!</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed font-medium">
                      Thank you for contacting SuperUI. An engineer will review your inquiry and respond to your email within 2 hours.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-6 px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Subject Tabs Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Select Inquiry Subject *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Technical Support', 'General Inquiry', 'Licensing', 'Custom Order'].map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setSubject(tab)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              subject === tab
                                ? 'bg-neutral-900 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Rahul Sharma"
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@company.com"
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Instagram Handle (Optional) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Instagram Handle (Optional)
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="@superui.in"
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
                      />
                    </div>

                    {/* Message Area */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Message Details *
                        </label>
                        <span className="text-[10px] text-neutral-400 font-medium">{message.length}/1000 chars</span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        maxLength={1000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe your question, order ID, or custom technical requirement..."
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 text-xs text-neutral-900 font-medium placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 shadow-sm transition-all resize-none"
                      />
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 hover:bg-brand-600 text-white text-xs font-extrabold shadow-xl transition-all hover:shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{loading ? 'Sending Request...' : 'Submit Inquiry'}</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
