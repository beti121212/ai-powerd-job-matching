import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Save, Settings } from 'lucide-react';
import api from '../../services/api';

const fallbackNotifications = [{ id: 'n-1', title: 'New candidate match', body: 'A registered seeker matches your Senior React Developer role at 94%.', read: false }];

function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } }

export function EmployerMessages() {
  const [search, setSearch] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInput = useRef(null);
  const messagesEndRef = useRef(null);

  const conversations = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mockConversations') || 'null');
      return Array.isArray(stored) && stored.length ? stored : [
        {
          id: 'conversation-601',
          companyName: 'Mekdes Tadesse',
          employerName: 'Hiring Team',
          jobTitle: 'Frontend Developer',
          lastMessage: 'I am available Thursday afternoon for the next interview stage.',
          lastMessageTime: '10:30 AM',
          unreadCount: 2,
          messages: [
            {
              id: 'message-1',
              sender: 'candidate',
              text: 'Hello, I am available Thursday afternoon for the next interview stage.',
              time: '10:20 AM',
            },
            {
              id: 'message-2',
              sender: 'employer',
              text: 'Great, we will send a calendar invite shortly.',
              time: '10:24 AM',
            },
            {
              id: 'message-3',
              sender: 'candidate',
              text: 'I am available Thursday afternoon for the next interview stage.',
              time: '10:30 AM',
            },
          ],
        },
        {
          id: 'conversation-602',
          companyName: 'Abel Bekele',
          employerName: 'Talent Team',
          jobTitle: 'Backend Developer',
          lastMessage: 'Thank you for your application. Our team will be in touch soon.',
          lastMessageTime: 'Yesterday',
          unreadCount: 0,
          messages: [
            {
              id: 'message-4',
              sender: 'employer',
              text: 'Thank you for your application. Our team will be in touch soon.',
              time: 'Yesterday',
            },
          ],
        },
        {
          id: 'conversation-603',
          companyName: 'Hana Solomon',
          employerName: 'Engineering Manager',
          jobTitle: 'Full Stack Software Engineer',
          lastMessage: 'Please share a convenient time for a follow-up.',
          lastMessageTime: 'Aug 22',
          unreadCount: 1,
          messages: [
            {
              id: 'message-5',
              sender: 'candidate',
              text: 'I enjoyed learning more about the engineering team.',
              time: 'Aug 22',
            },
            {
              id: 'message-6',
              sender: 'employer',
              text: 'Please share a convenient time for a follow-up.',
              time: 'Aug 22',
            },
          ],
        },
      ];
    } catch {
      return [
        {
          id: 'conversation-601',
          companyName: 'Mekdes Tadesse',
          employerName: 'Hiring Team',
          jobTitle: 'Frontend Developer',
          lastMessage: 'I am available Thursday afternoon for the next interview stage.',
          lastMessageTime: '10:30 AM',
          unreadCount: 2,
          messages: [
            {
              id: 'message-1',
              sender: 'candidate',
              text: 'Hello, I am available Thursday afternoon for the next interview stage.',
              time: '10:20 AM',
            },
            {
              id: 'message-2',
              sender: 'employer',
              text: 'Great, we will send a calendar invite shortly.',
              time: '10:24 AM',
            },
            {
              id: 'message-3',
              sender: 'candidate',
              text: 'I am available Thursday afternoon for the next interview stage.',
              time: '10:30 AM',
            },
          ],
        },
        {
          id: 'conversation-602',
          companyName: 'Abel Bekele',
          employerName: 'Talent Team',
          jobTitle: 'Backend Developer',
          lastMessage: 'Thank you for your application. Our team will be in touch soon.',
          lastMessageTime: 'Yesterday',
          unreadCount: 0,
          messages: [
            {
              id: 'message-4',
              sender: 'employer',
              text: 'Thank you for your application. Our team will be in touch soon.',
              time: 'Yesterday',
            },
          ],
        },
        {
          id: 'conversation-603',
          companyName: 'Hana Solomon',
          employerName: 'Engineering Manager',
          jobTitle: 'Full Stack Software Engineer',
          lastMessage: 'Please share a convenient time for a follow-up.',
          lastMessageTime: 'Aug 22',
          unreadCount: 1,
          messages: [
            {
              id: 'message-5',
              sender: 'candidate',
              text: 'I enjoyed learning more about the engineering team.',
              time: 'Aug 22',
            },
            {
              id: 'message-6',
              sender: 'employer',
              text: 'Please share a convenient time for a follow-up.',
              time: 'Aug 22',
            },
          ],
        },
      ];
    }
  }, []);

  const conversationItems = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mockConversations') || 'null');
      if (Array.isArray(stored) && stored.length) {
        return stored;
      }
    } catch {
      // Fall through to seeded conversations.
    }

    return conversations;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversationItems;

    return conversationItems.filter((conversation) =>
      [conversation.companyName, conversation.employerName, conversation.jobTitle, conversation.lastMessage].some((value) =>
        String(value || '').toLowerCase().includes(query),
      ),
    );
  }, [conversationItems, search]);

  const activeConversation = useMemo(
    () => conversationItems.find((item) => item.id === conversationId) || null,
    [conversationId, conversationItems],
  );

  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversationId]);

  const saveConversations = (items) => {
    localStorage.setItem('mockConversations', JSON.stringify(items));
  };

  const markConversationRead = (id) => {
    const next = conversationItems.map((conversation) =>
      String(conversation.id) === String(id)
        ? {
            ...conversation,
            unreadCount: 0,
            messages: conversation.messages.map((message) =>
              message.sender === 'candidate'
                ? { ...message, isRead: true }
                : message,
            ),
          }
        : conversation,
    );

    saveConversations(next);
    return next;
  };

  const handleSend = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text && !attachment) return;

    const nextMessages = [
      ...messages,
      {
        id: `message-${Date.now()}`,
        sender: 'employer',
        text: text || `Shared ${attachment.name}`,
        time: 'Just now',
        isRead: true,
      },
    ];

    const nextConversationItems = conversationItems.map((item) =>
      item.id === conversationId
        ? {
            ...item,
            messages: nextMessages,
            unreadCount: 0,
            lastMessage: text || `Shared ${attachment.name}`,
            lastMessageTime: 'Just now',
          }
        : item,
    );

    saveConversations(nextConversationItems);
    setInput('');
    setAttachment(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  };

  const openConversation = (id) => {
    const next = markConversationRead(id);
    saveConversations(next);
    setConversationId(id);
  };

  if (conversationId && activeConversation) {
    return (
      <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4">
            <button
              type="button"
              onClick={() => setConversationId('')}
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-(--brand-deep) hover:underline"
            >
              <span className="text-base">←</span>
              Back to Messages
            </button>
            <div className="ml-auto text-right">
              <h1 className="text-base font-black text-slate-900">{activeConversation.companyName}</h1>
              <p className="text-xs font-semibold text-slate-500">
                {activeConversation.jobTitle} · {activeConversation.employerName}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.sender === 'employer' ? 'items-end' : 'items-start'}`}
              >
                <span className="mb-1 px-1 text-[11px] font-bold text-slate-400">
                  {message.sender === 'employer' ? 'Employer' : 'Applicant'}
                </span>
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === 'employer' ? 'rounded-br-sm bg-slate-900 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'}`}
                >
                  {message.text}
                </p>
                <span className="mt-1 px-1 text-[11px] text-slate-400">{message.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Attach a file"
                onClick={() => fileInput.current?.click()}
                className="min-h-11 min-w-11 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <span className="flex items-center justify-center">📎</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                onChange={(event) => setAttachment(event.target.files?.[0] || null)}
                className="hidden"
              />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-(--brand-primary)"
              />
              <button
                type="submit"
                disabled={!input.trim() && !attachment}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-(--brand-primary) px-4 text-sm font-bold text-white hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <span className="text-base">➤</span>
                Send
              </button>
            </div>
            {attachment && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <span>Selected file: {attachment.name}</span>
                <button
                  type="button"
                  aria-label="Remove selected file"
                  onClick={() => setAttachment(null)}
                  className="text-slate-500 hover:text-red-600"
                >
                  <span className="text-base">×</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Messages</h1>
              <p className="mt-2 text-sm text-slate-500">Stay connected with applicants and track your conversations.</p>
            </div>
          </div>
        </header>

        <label className="mt-6 block">
          <span className="sr-only">Search conversations</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none focus:border-(--brand-primary)"
          />
        </label>

        <section className="mt-5 space-y-3" aria-label="Conversation list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => openConversation(conversation.id)}
                className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-(--brand-primary) hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2
                      className={`truncate text-base text-slate-900 ${conversation.unreadCount ? 'font-black' : 'font-bold'}`}
                    >
                      {conversation.companyName}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{conversation.jobTitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{conversation.lastMessageTime}</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p
                    className={`truncate text-sm ${conversation.unreadCount ? 'font-semibold text-slate-700' : 'text-slate-500'}`}
                  >
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-(--brand-soft) px-2.5 py-1 text-xs font-black text-(--brand-deep)">
                      {conversation.unreadCount} unread
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-base font-black text-slate-900">No conversations found.</h2>
              <p className="mt-2 text-sm text-slate-500">Try searching using a different applicant or job name.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
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
