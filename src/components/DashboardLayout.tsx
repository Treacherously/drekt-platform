'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from './Navbar';
import DrektStatsDashboard from './DrektStatsDashboard';
import DrektVision from './DrektVision';
import {
  LayoutDashboard,
  Radar,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

type DashboardView = 'stats' | 'vision' | 'messages';

interface NavItem {
  id: DashboardView;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'stats',
    label: 'DrektSTATS',
    sublabel: 'Overview & Analytics',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: 'vision',
    label: 'DrektVISION',
    sublabel: 'Supply Chain Intelligence',
    icon: <Radar className="w-4 h-4" />,
    badge: '1 Critical',
  },
  {
    id: 'messages',
    label: 'Messages',
    sublabel: 'Buyer Inquiries',
    icon: <MessageSquare className="w-4 h-4" />,
    badge: '34',
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_THREADS = [
  {
    id: 1,
    sender: 'Purest Drinking Water',
    avatar: 'P',
    subject: 'Inquiry: Bulk order — distilled water (500 cases)',
    preview: "Hi, we're interested in ordering 500 cases for our restaurant chain…",
    time: '10:42 AM',
    unread: true,
    tag: 'New',
  },
  {
    id: 2,
    sender: 'Jeida Farm Supply',
    avatar: 'J',
    subject: 'Agri-RESCUE: Logistics coordination',
    preview: 'Following up on the overripe banana pickup schedule you posted…',
    time: '9:15 AM',
    unread: true,
    tag: 'Agri-RESCUE',
  },
  {
    id: 3,
    sender: 'Manila Food Distributors',
    avatar: 'M',
    subject: 'Re: Cold storage requirements',
    preview: 'Thanks for the spec sheet. We can accommodate up to 10 pallets…',
    time: 'Yesterday',
    unread: false,
    tag: null,
  },
  {
    id: 4,
    sender: 'Santos Packaging Corp.',
    avatar: 'S',
    subject: 'Product catalog request',
    preview: 'Could you share your latest catalog and MOQ pricing for Q2?',
    time: 'Mon',
    unread: false,
    tag: null,
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    from: 'buyer',
    sender: 'Purest Drinking Water',
    text: "Hi, we're interested in ordering 500 cases of your distilled water for our restaurant chain. Can you confirm current stock availability and pricing for bulk orders?",
    time: '10:42 AM',
  },
  {
    id: 2,
    from: 'supplier',
    sender: 'You',
    text: 'Hello! Thank you for reaching out. We currently have 2,000 cases in stock at ₱85/case for orders over 200 units. Delivery is available within Metro Manila in 2–3 business days.',
    time: '10:55 AM',
  },
  {
    id: 3,
    from: 'buyer',
    sender: 'Purest Drinking Water',
    text: 'That sounds great. Could you provide a formal quotation? We\'ll need delivery to Makati City — please include any applicable freight charges.',
    time: '11:08 AM',
  },
];

function MockInbox() {
  const [activeThread, setActiveThread] = useState(1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Buyer inquiries and supplier conversations</p>
        </div>
        <span className="text-xs font-semibold bg-brand-accent/10 text-brand-accent dark:bg-brand-primary/10 dark:text-brand-primary rounded-full px-2.5 py-1">
          2 unread
        </span>
      </div>

      {/* Two-column layout */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden flex" style={{ height: '520px' }}>

        {/* ── Left: Thread list ── */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
            <input
              readOnly
              placeholder="Search messages…"
              className="w-full text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md px-2.5 py-1.5 text-gray-400 dark:text-slate-500 placeholder-gray-400 dark:placeholder-slate-600 outline-none cursor-default"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {MOCK_THREADS.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread.id)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                  activeThread === thread.id
                    ? 'bg-brand-accent/5 dark:bg-brand-primary/10 border-l-2 border-l-brand-accent dark:border-l-brand-primary'
                    : thread.unread
                    ? 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-accent dark:text-brand-primary font-bold text-xs flex-shrink-0 mt-0.5">
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs truncate ${thread.unread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {thread.sender}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">{thread.time}</span>
                    </div>
                    <p className={`text-xs truncate mb-1 ${thread.unread ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                      {thread.subject}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {thread.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent dark:bg-brand-primary flex-shrink-0" />}
                      {thread.tag && (
                        <span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                          thread.tag === 'Agri-RESCUE'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-brand-accent/10 text-brand-accent dark:bg-brand-primary/20 dark:text-brand-primary'
                        }`}>
                          {thread.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Conversation pane ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Conversation header */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Purest Drinking Water</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Inquiry: Bulk order — distilled water (500 cases)</p>
              </div>
              <span className="text-xs font-semibold bg-brand-accent/10 text-brand-accent dark:bg-brand-primary/10 dark:text-brand-primary rounded-full px-2 py-0.5">New</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
            {MOCK_MESSAGES.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.from === 'supplier' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                  msg.from === 'supplier'
                    ? 'bg-brand-accent text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {msg.from === 'supplier' ? 'S' : 'P'}
                </div>
                <div className={`max-w-[75%] ${msg.from === 'supplier' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === 'supplier'
                      ? 'bg-brand-accent text-white rounded-tr-sm'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                readOnly
                placeholder="Type your reply…"
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2 text-gray-400 dark:text-slate-500 placeholder-gray-400 dark:placeholder-slate-600 outline-none cursor-default"
              />
              <button
                type="button"
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#002db3' }}
              >
                Send
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-1.5 text-center">
              Live messaging is part of Phase 3. This is a demo preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [activeView, setActiveView] = useState<DashboardView>('stats');
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isGuest = !session || session?.user?.role === 'GUEST';

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#121212] overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Side Navigation ─────────────────────────────────────────── */}
        <aside className="w-56 flex-shrink-0 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
          {/* Section label */}
          <div className="px-4 pt-5 pb-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{isGuest ? 'Demo Mode' : 'Supplier Portal'}</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 pb-4 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    isActive
                      ? 'bg-brand-primary/20 text-brand-accent dark:bg-brand-primary/10 dark:text-brand-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-brand-accent dark:text-brand-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-none mb-0.5 ${isActive ? 'text-brand-accent dark:text-brand-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.sublabel}</p>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-semibold rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                        item.id === 'vision'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin shortcut — only visible to ADMIN role */}
          {isAdmin && (
            <div className="px-2 pb-2">
              <a
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
              >
                <span className="flex-shrink-0 text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none mb-0.5 text-red-600 dark:text-red-400">Admin Dashboard</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Platform controls</p>
                </div>
              </a>
            </div>
          )}

          {/* Bottom: profile stub */}
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4">
            {isGuest ? (
              <a
                href="/login"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-accent/5 dark:bg-brand-primary/10 border border-brand-accent/20 dark:border-brand-primary/20 hover:bg-brand-accent/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs flex-shrink-0">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brand-accent dark:text-brand-primary truncate">Create Account</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Unlock all features</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 flex items-center justify-center text-brand-accent dark:text-brand-primary font-bold text-xs flex-shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">Supplier Account</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Free plan</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {isGuest && (
            <div className="bg-brand-accent/5 dark:bg-brand-primary/10 border-b border-brand-accent/10 dark:border-brand-primary/20 px-6 py-2.5 flex items-center justify-between gap-4">
              <p className="text-xs text-brand-accent dark:text-brand-primary">
                <span className="font-semibold">👁 Guest Mode</span> — You&apos;re viewing a read-only demo. Data editing is disabled.
              </p>
              <a href="/login" className="text-xs font-semibold text-brand-accent dark:text-brand-primary hover:underline whitespace-nowrap">
                Create Account →
              </a>
            </div>
          )}
          <div className="max-w-6xl mx-auto px-6 py-6">
            {activeView === 'stats' && <DrektStatsDashboard />}
            {activeView === 'vision' && <DrektVision />}
            {activeView === 'messages' && <MockInbox />}
          </div>
        </main>
      </div>
    </div>
  );
}
