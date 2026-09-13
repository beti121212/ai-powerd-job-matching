import React, { useState, useEffect } from 'react';

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, applications, messages, system
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employer/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/employer/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      }
    } catch (err) {
      alert('Failed to mark as read: ' + err.message);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      const token = localStorage.getItem('token');
      try {
        await fetch('/api/employer/notifications/mark-read', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ notificationId: notif.id })
        });
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    
    if (notif.action_url) {
      window.location.href = notif.action_url;
    }
  };

  // Notification Badges (7 Types):
  const getTypeBadge = (type, priority) => {
    if (type === 'system_announcement' || type === 'system-announcement') {
      return priority === 'urgent' 
        ? { label: 'Urgent Alert', color: 'bg-rose-50 text-rose-700 border-rose-200' }
        : { label: 'System Notice', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    
    const typeMapping = {
      'new_applicant': { label: 'Application', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      'new-applicant': { label: 'Application', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      'candidate_message': { label: 'Message', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      'candidate-message': { label: 'Message', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      'ai_match_alert': { label: 'AI Match', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'ai-match-alert': { label: 'AI Match', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'job_expiring': { label: 'Expiring Soon', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      'job-expiring': { label: 'Expiring Soon', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      'company_verified': { label: 'Verification', color: 'bg-teal-50 text-teal-700 border-teal-200' },
      'company-verified': { label: 'Verification', color: 'bg-teal-50 text-teal-700 border-teal-200' },
      'interview_reminder': { label: 'Interview', color: 'bg-sky-50 text-sky-700 border-sky-200' },
      'interview-reminder': { label: 'Interview', color: 'bg-sky-50 text-sky-700 border-sky-200' },
      'application-status': { label: 'Status Update', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    };
    
    return typeMapping[type] || { label: 'Notification', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Filter items:
  const filteredNotifs = notifications.filter(n => {
    const notifType = String(n.type || '').toLowerCase();
    if (filter === 'unread') return !n.is_read;
    if (filter === 'applications') return notifType.includes('applicant') || notifType.includes('application');
    if (filter === 'messages') return notifType.includes('message');
    if (filter === 'system') return notifType.includes('system') || notifType.includes('announcement');
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const applicationCount = notifications.filter(n => String(n.type || '').toLowerCase().includes('applicant') || String(n.type || '').toLowerCase().includes('application')).length;
  const messageCount = notifications.filter(n => String(n.type || '').toLowerCase().includes('message')).length;
  const systemCount = notifications.filter(n => String(n.type || '').toLowerCase().includes('system') || String(n.type || '').toLowerCase().includes('announcement')).length;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time activity logs, candidate responses, and important system-wide security & maintenance notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap self-start sm:self-center"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Toolbar (Includes System Notices) */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100/80 rounded-2xl border border-slate-200/90 mb-6">
        {[
          { key: 'all', label: 'All Updates', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'applications', label: 'Applications', count: applicationCount },
          { key: 'messages', label: 'Messages', count: messageCount },
          { key: 'system', label: 'System Notices', count: systemCount },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === btn.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{btn.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              filter === btn.key ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-sm">Loading notifications...</p>
        </div>
      ) : filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => {
            const badge = getTypeBadge(notif.type, notif.priority);
            const notifTime = new Date(notif.created_at);
            const formattedTime = notifTime.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !notif.is_read
                    ? 'bg-blue-50/30 border-blue-200 hover:border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color} whitespace-nowrap`}>
                      {badge.label}
                    </span>
                    <h3 className={`text-sm tracking-tight ${!notif.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {notif.message}
                  </p>

                  <span className="inline-block text-[11px] text-slate-400 mt-2 font-medium">
                    {formattedTime}
                  </span>
                </div>

                <div className="text-slate-400 hover:text-slate-700 text-xs font-bold shrink-0">
                  →
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          <p className="mb-2">No notifications found in this category.</p>
          <p className="text-[11px]">When you receive applications, messages, or system notices, they'll appear here.</p>
        </div>
      )}

    </div>
  );
};

export default NotificationsView;
