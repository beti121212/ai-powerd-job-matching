import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Paperclip, Send, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const CONVERSATIONS_KEY = "mockConversations";

const conversations = [
  {
    id: "conversation-501",
    companyName: "Blue Nile Tech",
    employerName: "Hiring Team",
    jobTitle: "Frontend Developer",
    lastMessage: "We would like to discuss your application.",
    lastMessageTime: "10:30 AM",
    unreadCount: 2,
    messages: [
      {
        id: "message-1",
        sender: "employer",
        text: "Hello, we reviewed your application.",
        time: "10:20 AM",
      },
      {
        id: "message-2",
        sender: "seeker",
        text: "Thank you for the update.",
        time: "10:24 AM",
      },
      {
        id: "message-3",
        sender: "employer",
        text: "We would like to discuss your application.",
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "conversation-502",
    companyName: "ABC Company",
    employerName: "Talent Team",
    jobTitle: "Backend Developer",
    lastMessage: "Thank you for your application.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "message-4",
        sender: "employer",
        text: "Thank you for your application. Our team will be in touch soon.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "conversation-503",
    companyName: "EthioFinTech Labs",
    employerName: "Engineering Manager",
    jobTitle: "Full Stack Software Engineer",
    lastMessage: "Please share a convenient time for a follow-up.",
    lastMessageTime: "Aug 22",
    unreadCount: 1,
    messages: [
      {
        id: "message-5",
        sender: "seeker",
        text: "I enjoyed learning more about the engineering team.",
        time: "Aug 22",
      },
      {
        id: "message-6",
        sender: "employer",
        text: "Please share a convenient time for a follow-up.",
        time: "Aug 22",
      },
    ],
  },
];

function getConversations() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(CONVERSATIONS_KEY) || "null",
    );
    return Array.isArray(stored) ? stored : conversations;
  } catch {
    return conversations;
  }
}

function saveConversations(items) {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(items));
}

function markConversationRead(id) {
  const next = getConversations().map((conversation) =>
    String(conversation.id) === String(id)
      ? {
          ...conversation,
          unreadCount: 0,
          messages: conversation.messages.map((message) =>
            message.sender === "employer"
              ? { ...message, isRead: true }
              : message,
          ),
        }
      : conversation,
  );
  saveConversations(next);
  return next;
}

function MessagesList({
  search,
  setSearch,
  conversations: conversationItems,
  onOpen,
}) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversationItems;
    return conversationItems.filter((conversation) =>
      [
        conversation.companyName,
        conversation.employerName,
        conversation.jobTitle,
        conversation.lastMessage,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [conversationItems, search]);

  return (
    <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Messages</h1>
              <p className="mt-2 text-sm text-slate-500">Stay connected with employers and track your conversations.</p>
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
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none focus:border-[var(--brand-primary)]"
          />
        </label>
        <section className="mt-5 space-y-3" aria-label="Conversation list">
          {filtered.length > 0 ? (
            filtered.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onOpen(conversation.id)}
                className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[var(--brand-primary)] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2
                      className={`truncate text-base text-slate-900 ${conversation.unreadCount ? "font-black" : "font-bold"}`}
                    >
                      {conversation.companyName}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {conversation.jobTitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {conversation.lastMessageTime}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p
                    className={`truncate text-sm ${conversation.unreadCount ? "font-semibold text-slate-700" : "text-slate-500"}`}
                  >
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-black text-[var(--brand-deep)]">
                      {conversation.unreadCount} unread
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-base font-black text-slate-900">
                No conversations found.
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try searching using a different company or employer name.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Conversation({ conversation }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(conversation.messages);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const fileInput = useRef(null);

  const handleSend = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text && !attachment) return;
    const nextMessages = [
      ...messages,
      {
        id: `message-${Date.now()}`,
        sender: "seeker",
        text: text || `Shared ${attachment.name}`,
        time: "Just now",
        isRead: true,
      },
    ];
    setMessages(nextMessages);
    saveConversations(
      getConversations().map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              messages: nextMessages,
              unreadCount: 0,
              lastMessage: text || `Shared ${attachment.name}`,
              lastMessageTime: "Just now",
            }
          : item,
      ),
    );
    setInput("");
    setAttachment(null);
  };

  return (
    <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--brand-deep)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Messages
          </button>
          <div className="ml-auto text-right">
            <h1 className="text-base font-black text-slate-900">
              {conversation.companyName}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {conversation.jobTitle} · {conversation.employerName}
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.sender === "seeker" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 px-1 text-[11px] font-bold text-slate-400">
                {message.sender === "seeker" ? "Job Seeker" : "Employer"}
              </span>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "seeker" ? "rounded-br-sm bg-slate-900 text-white" : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"}`}
              >
                {message.text}
              </p>
              <span className="mt-1 px-1 text-[11px] text-slate-400">
                {message.time}
              </span>
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white p-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Attach a file"
              onClick={() => fileInput.current?.click()}
              className="min-h-11 min-w-11 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <Paperclip className="mx-auto h-4 w-4" />
            </button>
            <input
              ref={fileInput}
              type="file"
              onChange={(event) =>
                setAttachment(event.target.files?.[0] || null)
              }
              className="hidden"
            />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message..."
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[var(--brand-primary)]"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-primary-hover)]"
            >
              <Send className="h-4 w-4" /> Send
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
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default function Communication() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const conversationItems = getConversations();
  const conversation =
    conversationId &&
    conversationItems.find((item) => item.id === conversationId);
  if (conversationId) {
    if (conversation) markConversationRead(conversationId);
    return conversation ? (
      <Conversation conversation={{ ...conversation, unreadCount: 0 }} />
    ) : (
      <main className="min-h-[70vh] bg-slate-50 p-10 text-center">
        <h1 className="text-xl font-black text-slate-900">
          Conversation unavailable
        </h1>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="mt-4 font-bold text-[var(--brand-deep)]"
        >
          Back to Messages
        </button>
      </main>
    );
  }
  return (
    <MessagesList
      search={search}
      setSearch={setSearch}
      conversations={conversationItems}
      onOpen={(id) => {
        markConversationRead(id);
        navigate(`/chat/${id}`);
      }}
    />
  );
}
