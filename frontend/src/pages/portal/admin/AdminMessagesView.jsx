import React, { useState, useEffect } from 'react';
import { usePortalAuth } from '../../../hooks/usePortalAuth';
import { Mail, Phone, User, Calendar, Trash2, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

const AdminMessagesView = () => {
  const { token } = usePortalAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact-messages/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.message || 'Failed to load messages.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/contact-messages/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => prev.filter(m => m._id !== id));
      } else {
        alert(data.message || 'Failed to delete message.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMessages();
    }
  }, [token]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-bold text-primary-800">Patient Messages & Inquiries</h2>
        </div>
        <span className="bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full">
          Total: {messages.length}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-gray-500 font-medium animate-pulse">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium">No messages received yet.</p>
          <p className="text-xs text-gray-400 mt-1">Submissions from the Contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg._id} 
              className="border border-gray-100 rounded-xl p-5 hover:border-primary-100 hover:bg-gray-50/30 transition-all shadow-xs relative"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base">{msg.subject}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {msg.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {msg.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {msg.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    disabled={actionLoading === msg._id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50 cursor-pointer"
                    title="Delete Message"
                  >
                    {actionLoading === msg._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesView;
