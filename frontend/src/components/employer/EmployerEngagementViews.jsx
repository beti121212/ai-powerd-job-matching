import { useEffect, useState } from 'react';
import { Bell, Check, MessageCircle, Save, Settings } from 'lucide-react';
import api from '../../services/api';

const fallbackMessages = [{ id: 'm-1', from: 'Mekdes Tadesse', subject: 'Interview availability', body: 'I am available Thursday afternoon for the next interview stage.', read: false }];
const fallbackNotifications = [{ id: 'n-1', title: 'New candidate match', body: 'A registered seeker matches your Senior React Developer role at 94%.', read: false }];

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }

export function EmployerMessages() {
  const [messages, setMessages] = useState(fallbackMessages);
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/employer/messages')
      .then(({ data }) => setMessages(data?.messages?.length ? data.messages : fallbackMessages))
      .catch(() => setMessages(read('employerMessages', fallbackMessages)));
  }, []);

  const sendReply = async (message) => {
    if (!reply.trim()) return;
    const payload = {
      candidateId: message.candidateId || message.userId || message.id,
      subject: message.subject || 'Reply',
      body: reply.trim(),
    };

    try {
      await api.post('/employer/messages', payload);
      setNotice('Reply sent');
      setReply('');
      const refreshed = await api.get('/employer/messages');
      setMessages(refreshed.data?.messages?.length ? refreshed.data.messages : messages);
    } catch {
      localStorage.setItem('employerMessages', JSON.stringify([{ ...message, lastReply: payload.body }, ...messages.filter((item) => item.id !== message.id)]));
      setNotice('Reply queued locally');
      setReply('');
    }
  };

  return <ViewFrame icon={MessageCircle} title="Messages" subtitle="Keep conversations with candidates moving.">{messages.map((message) => <article key={message.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{message.subject || `Message from ${message.fromName || message.from || 'Candidate'}`}</h3><p className="mt-1 text-xs font-bold text-blue-600">{message.fromName || message.from || message.fromEmail || 'Candidate'}</p></div>{!message.isRead && <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black text-blue-700">NEW</span>}</div><p className="mt-4 text-sm leading-6 text-slate-600">{message.body}</p><div className="mt-4 flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500" /><button onClick={() => sendReply(message)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Reply</button></div></article>)}{notice && <p className="text-sm font-bold text-emerald-600">{notice}</p>}</ViewFrame>;
}

export function EmployerNotifications() {
  const [notifications, setNotifications] = useState(fallbackNotifications);

  useEffect(() => {
    api.get('/employer/notifications')
      .then(({ data }) => setNotifications(data?.notifications?.length ? data.notifications : fallbackNotifications))
      .catch(() => setNotifications(read('employerNotifications', fallbackNotifications)));
  }, []);

  const markRead = async (item) => {
    setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, isRead: true, read: true } : notification));
    try {
      await api.patch(`/employer/notifications/${item.id}/read`);
    } catch (requestError) {
      console.warn('Unable to mark notification as read:', requestError);
    }
  };

  return <ViewFrame icon={Bell} title="Notifications" subtitle="Stay current with candidates, jobs, and team activity.">{notifications.map((item) => <article key={item.id} className={`flex items-start gap-4 rounded-2xl border p-5 ${item.isRead || item.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/50'}`}><Bell className="mt-1 h-5 w-5 shrink-0 text-blue-600" /><div className="min-w-0 flex-1"><h3 className="font-black text-slate-900">{item.title}</h3><p className="mt-1 text-sm text-slate-600">{item.body || item.message}</p></div>{!(item.isRead || item.read) && <button onClick={() => markRead(item)} className="inline-flex items-center gap-1 text-xs font-bold text-blue-700"><Check className="h-4 w-4" /> Mark read</button>}</article>)}</ViewFrame>;
}

export function EmployerSettings() {
  const [settings, setSettings] = useState(() => read('employerSettings', { emailAlerts: true, matchingAlerts: true, weeklyDigest: false }));

  useEffect(() => {
    api.get('/employer/settings')
      .then(({ data }) => {
        const next = data?.settings || {};
        setSettings({
          emailAlerts: next.emailAlerts ?? true,
          matchingAlerts: next.matchingAlerts ?? true,
          weeklyDigest: next.weeklyDigest ?? false,
          notificationEmail: next.notificationEmail || '',
        });
      })
      .catch(() => setSettings(read('employerSettings', { emailAlerts: true, matchingAlerts: true, weeklyDigest: false })));
  }, []);

  const save = async () => {
    localStorage.setItem('employerSettings', JSON.stringify(settings));
    try {
      await api.put('/employer/settings', settings);
    } catch (requestError) {
      console.warn('Unable to save employer settings:', requestError);
    }
  };

  return <ViewFrame icon={Settings} title="Settings" subtitle="Control workspace alerts and matching preferences."><div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{[['emailAlerts', 'Email alerts', 'Receive important recruitment updates by email.'], ['matchingAlerts', 'AI matching alerts', 'Get notified when new registered talent matches an open role.'], ['weeklyDigest', 'Weekly digest', 'Receive a weekly summary of workspace activity.']].map(([key, label, description]) => <label key={key} className="flex items-center justify-between gap-4 p-5"><span><span className="block font-black text-slate-900">{label}</span><span className="mt-1 block text-sm text-slate-500">{description}</span></span><input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.checked }))} className="h-5 w-5 accent-blue-600" /></label>)}</div><button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"><Save className="h-4 w-4" /> Save Settings</button></ViewFrame>;
}

function ViewFrame({ icon: Icon, title, subtitle, children }) { return <section className="space-y-5"><div className="flex items-start gap-3"><Icon className="mt-1 h-7 w-7 text-blue-600" /><div><h2 className="text-2xl font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div></div><div className="space-y-3">{children}</div></section>; }
