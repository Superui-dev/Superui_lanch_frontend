import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { Mail, Trash2, ShieldCheck, Clock, Reply, X, Inbox, Loader2 } from 'lucide-react';

const Contacts = () => {
  const { colors } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeMessage, setActiveMessage] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/contacts');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setMessages(res.data.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Failed to fetch contact messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkSpam = async (id) => {
    if (!window.confirm('Are you sure you want to mark this message as spam?')) return;
    try {
      await client.put(`/api/admin/contacts/${id}/status`, { status: 'spam' });
      setActiveMessage(null);
      await fetchMessages();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText || !activeMessage) return;
    try {
      await client.post('/api/admin/email/send', {
        toAddress: activeMessage.email,
        subject: `Re: Contact Form Submission - SuperUI`,
        body: replyText
      });
      await client.put(`/api/admin/contacts/${activeMessage._id}/status`, { status: 'replied' });
      alert(`Reply sent to ${activeMessage.email} successfully!`);
      setReplyText('');
      setActiveMessage(null);
      await fetchMessages();
    } catch (err) {
      alert('Failed to send reply email: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredMessages = useMemo(() => {
    if (!selectedDate) return messages;
    return messages.filter(m => {
      const createdDate = new Date(m.createdAt || m.date).toISOString().split('T')[0];
      return createdDate === selectedDate;
    });
  }, [messages, selectedDate]);

  const paginatedMessages = useMemo(() => {
    return filteredMessages.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredMessages, currentPage]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text}`}>Contact Inbox</h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Read customer requests, filter spam bots, and trigger support responses.</p>
          </div>

          <AdminDatePicker label="Message Date" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="flex justify-center py-24 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              </div>
            ) : paginatedMessages.length === 0 ? (
              <div className={`p-12 text-center border ${colors.cardBorder} ${colors.bgCard} rounded-2xl`}>
                <Inbox className={`h-10 w-10 mx-auto ${colors.textMuted} mb-2`} />
                <p className={`text-sm ${colors.textSecondary} font-medium`}>No messages received</p>
              </div>
            ) : (
              paginatedMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-5 rounded-2xl border transition-all shadow-sm ${
                    msg.status === 'new' || msg.status === 'unread'
                      ? `${colors.accentBg} ${colors.accentBorder}`
                      : msg.status === 'spam'
                        ? `${colors.bgSecondary} ${colors.border} opacity-45`
                        : `${colors.bgCard} ${colors.border}`
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${colors.text} text-sm`}>{msg.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${
                          msg.status === 'new' || msg.status === 'unread'
                            ? colors.badge
                            : msg.status === 'spam'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : `${colors.bgSecondary} ${colors.textSecondary} ${colors.border}`
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className={`text-[10px] ${colors.accent}`}>{msg.email}</p>
                    </div>

                    <span className={`text-[10px] ${colors.textMuted} font-medium`}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className={`text-xs ${colors.textSecondary} mt-4 leading-relaxed`}>{msg.message}</p>

                  {msg.status !== 'spam' && (
                    <div className={`pt-4 border-t ${colors.border} mt-4 flex justify-between items-center`}>
                      <button
                        onClick={() => setActiveMessage(msg)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl ${colors.bgSecondary} border ${colors.border} text-[10px] font-medium ${colors.textSecondary} hover:text-neutral-900 transition-all duration-200`}
                      >
                        <Reply className={`h-3.5 w-3.5 ${colors.accent}`} />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleMarkSpam(msg._id)}
                        className="text-[10px] font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Mark Spam
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            <Pagination
              currentPage={currentPage}
              totalItems={filteredMessages.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>

          {activeMessage && (
            <form onSubmit={handleSendReply} className={`lg:col-span-5 ${colors.bgCard} border ${colors.cardBorder} p-6 rounded-2xl space-y-5 shadow-sm`}>
              <div className={`flex justify-between items-center pb-4 border-b ${colors.border}`}>
                <h2 className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                  Draft Reply
                </h2>
                <button type="button" onClick={() => setActiveMessage(null)} className={`${colors.textMuted} hover:text-neutral-900 transition-colors`}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className={`p-3.5 rounded-xl ${colors.bgInput} ${colors.textSecondary} leading-normal border ${colors.borderInput}`}>
                  <span className={`font-medium ${colors.text} text-[10px] block mb-1`}>To: {activeMessage.name} ({activeMessage.email})</span>
                  <p className="line-clamp-2 italic">"{activeMessage.message}"</p>
                </div>

                <div>
                  <label className={`block ${colors.textSecondary} font-medium mb-1.5 uppercase text-[10px]`}>Message Draft</label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your support message response here..."
                    className={`w-full ${colors.bgInput} border ${colors.borderInput} rounded-xl px-3.5 py-2.5 ${colors.text} placeholder:text-neutral-400 focus:outline-none ${colors.inputFocus} transition-all duration-200 resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all duration-200 hover:shadow-lg btn-shine"
                >
                  Send Reply Mail
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Contacts;
