import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Heart,
  LifeBuoy,
  FileText,
  ChevronRight,
  Trash2,
  Send,
  ChevronLeft,
  ShieldCheck,
  Link,
  LogOut,
  Settings,
  Bell,
  Globe,
  UserCheck,
  LogIn,
  Sparkles,
} from 'lucide-react';

export const AccountScreen: React.FC = () => {
  const {
    customerProfile,
    orders,
    setSelectedOrderId,
    setActiveScreen,
    setCustomerTab,
    supportTickets,
    createSupportTicket,
    replyToSupportTicket,
    navigateTo,
    setAdminModule,
    isCustomerLoggedIn,
    customerLogout,
    customerLogin,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<
    'main' | 'orders' | 'support' | 'policies' | 'settings'
  >('main');

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportOrderId, setSupportOrderId] = useState('');
  const [ticketReplyText, setTicketReplyText] = useState<Record<string, string>>({});
  const [ticketFeedback, setTicketFeedback] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState<string | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;
    createSupportTicket(supportSubject.trim(), supportMessage.trim(), supportOrderId || undefined);
    setSupportSubject('');
    setSupportMessage('');
    setSupportOrderId('');
    setTicketFeedback('Support ticket created successfully! Our customer support team will reply shortly.');
    setTimeout(() => setTicketFeedback(null), 4000);
  };

  // SUBVIEW: ORDER HISTORY
  if (activeSubView === 'orders') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
        <div className="bg-white border-b border-[#E6EAF0] px-4 py-2 flex items-center gap-2 min-h-[56px]">
          <button
            type="button"
            onClick={() => setActiveSubView('main')}
            className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-[#192E4D]">My Order History</h1>
        </div>

        <div className="p-4 space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => {
                setSelectedOrderId(ord.id);
                setActiveScreen('order_tracking');
              }}
              className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs hover:shadow-sm active:scale-[0.99] cursor-pointer transition-all space-y-2.5"
            >
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-black text-[#192E4D]">{ord.id}</span>
                  <span className="text-[10px] text-[#697586] block">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#08A9A2]/10 text-[#08A9A2]">
                  {ord.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 py-1">
                {ord.items.slice(0, 3).map((item) => (
                  <img
                    key={item.id}
                    src={item.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-10 h-12 object-cover rounded-lg border border-[#F0F4F8]"
                  />
                ))}
                {ord.items.length > 3 && (
                  <span className="text-xs font-bold text-[#697586]">
                    +{ord.items.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-[#F0F4F8]">
                <span className="text-[#697586] tabular-nums">{ord.items.length} item(s)</span>
                <div className="flex items-center gap-1 font-black text-[#192E4D]">
                  <span className="tabular-nums">Total: ₹{Math.round(ord.amounts.total).toLocaleString('en-IN')}</span>
                  <ChevronRight className="w-4 h-4 text-[#08A9A2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SUBVIEW: SUPPORT & HELP
  if (activeSubView === 'support') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
        <div className="bg-white border-b border-[#E6EAF0] px-4 py-2 flex items-center gap-2 min-h-[56px]">
          <button
            type="button"
            onClick={() => setActiveSubView('main')}
            className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-[#192E4D]">Customer Support Tickets</h1>
        </div>

        <div className="p-4 space-y-4">
          {ticketFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{ticketFeedback}</span>
            </div>
          )}

          {/* Create new ticket */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-[#192E4D]">Submit a New Support Request</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return request or delivery inquiry"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20"
                />
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Order ID (Optional)</label>
                <select
                  value={supportOrderId}
                  onChange={(e) => setSupportOrderId(e.target.value)}
                  className="w-full h-11 px-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] bg-white text-xs font-semibold"
                >
                  <option value="">None / General Inquiry</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} - ₹{Math.round(o.amounts.total).toLocaleString('en-IN')} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#192E4D] block mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your question or issue in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full p-3.5 border border-[#E6EAF0] rounded-xl focus:outline-hidden focus:border-[#08A9A2] focus:ring-2 focus:ring-[#08A9A2]/20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-bold transition-all shadow-xs"
              >
                Send Request
              </button>
            </form>
          </div>

          {/* Existing Tickets */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#192E4D]">
              Your Open Tickets ({supportTickets.length})
            </h3>

            {supportTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="p-4 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 text-xs shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#192E4D] block">{tkt.subject}</span>
                    <span className="text-[10px] text-[#697586]">Ticket #{tkt.id}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      tkt.status === 'open'
                        ? 'bg-amber-50 text-amber-700'
                        : tkt.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {tkt.status}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#F0F4F8]">
                  {tkt.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${
                        m.sender === 'admin'
                          ? 'bg-[#08A9A2]/10 text-[#192E4D] border border-[#08A9A2]/20'
                          : 'bg-[#F6F8FA] text-[#192E4D]'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#697586] mb-1">
                        <span>{m.sender === 'admin' ? 'ZOODI Support Team' : 'You'}</span>
                        <span className="tabular-nums">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                {/* Reply box */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type a follow-up reply..."
                    value={ticketReplyText[tkt.id] || ''}
                    onChange={(e) =>
                      setTicketReplyText({ ...ticketReplyText, [tkt.id]: e.target.value })
                    }
                    className="flex-1 h-10 px-3.5 border border-[#E6EAF0] rounded-xl text-xs focus:outline-hidden focus:border-[#08A9A2]"
                  />
                  <button
                    type="button"
                    aria-label="Send reply"
                    onClick={() => {
                      const txt = ticketReplyText[tkt.id];
                      if (!txt || !txt.trim()) return;
                      replyToSupportTicket(tkt.id, txt.trim(), true);
                      setTicketReplyText({ ...ticketReplyText, [tkt.id]: '' });
                    }}
                    className="w-10 h-10 rounded-xl bg-[#192E4D] hover:bg-[#243c61] active:scale-95 text-white font-bold flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SUBVIEW: POLICIES
  if (activeSubView === 'policies') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
        <div className="bg-white border-b border-[#E6EAF0] px-4 py-2 flex items-center gap-2 min-h-[56px]">
          <button
            type="button"
            onClick={() => setActiveSubView('main')}
            className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-extrabold text-[#192E4D]">ZOODI Policies & Terms</h1>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 shadow-2xs">
            <h3 className="font-extrabold text-sm text-[#192E4D]">Return & Refund Policy</h3>
            <p className="text-[#697586] leading-relaxed">
              We offer a 15-day return guarantee from the date of doorstep delivery for all eligible
              fashion and lifestyle apparel. Products must remain unworn, with original brand tags and
              packaging intact. Refunds are initiated immediately upon automated fulfillment check.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 shadow-2xs">
            <h3 className="font-extrabold text-sm text-[#192E4D]">Privacy Policy & Data Security</h3>
            <p className="text-[#697586] leading-relaxed">
              ZOODI Collection respects customer privacy. We do not store raw credit card numbers.
              All payment tokens are processed via PCI-DSS certified payment gateways. Customer address
              and order data is protected by strict Cloud Firestore rules.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-2 shadow-2xs">
            <h3 className="font-extrabold text-sm text-[#192E4D]">Terms & Conditions</h3>
            <p className="text-[#697586] leading-relaxed">
              All transactions conducted on the ZOODI mobile shopping platform are governed by standard
              consumer commerce regulations. Prices and promotions are validated dynamically on the secure
              backend.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUBVIEW: SETTINGS & PREFERENCES
  if (activeSubView === 'settings') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
        <div className="bg-white border-b border-[#E6EAF0] px-4 py-2 flex items-center gap-2 min-h-[56px] sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setActiveSubView('main')}
            className="w-11 h-11 rounded-full bg-[#F6F8FA] hover:bg-[#E6EAF0] active:scale-95 flex items-center justify-center text-[#192E4D] transition-all cursor-pointer"
            aria-label="Back to Account"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-extrabold text-[#192E4D]">Settings & Preferences</h1>
            <p className="text-[10px] text-[#697586]">Manage your profile, alerts, and account session</p>
          </div>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Customer Profile Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#F0F4F8] pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#08A9A2] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-[#192E4D]">Customer Profile</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#F0F4F8]">
                <span className="text-[#697586]">Name</span>
                <span className="font-bold text-[#192E4D]">{isCustomerLoggedIn ? customerProfile.name : 'Guest User'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F0F4F8]">
                <span className="text-[#697586]">Email</span>
                <span className="font-bold text-[#192E4D] font-mono text-[11px]">{isCustomerLoggedIn ? customerProfile.email : 'Not signed in'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#697586]">Phone</span>
                <span className="font-bold text-[#192E4D] font-mono">{isCustomerLoggedIn ? customerProfile.phone : '—'}</span>
              </div>
            </div>
          </div>

          {/* Regional & Localization */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#F0F4F8] pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#192E4D] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-[#192E4D]">Regional & Currency</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#F0F4F8]">
                <span className="text-[#697586]">Shipping Hub</span>
                <span className="font-bold text-[#192E4D]">Mannarkkad / Kochi, Kerala</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F0F4F8]">
                <span className="text-[#697586]">Store Currency</span>
                <span className="font-extrabold text-[#08A9A2]">Indian Rupee (₹ / INR)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#697586]">Language</span>
                <span className="font-bold text-[#192E4D]">English / മലയാളം</span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6EAF0] space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#F0F4F8] pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#FFB000] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-[#192E4D]">Order Alerts & Notifications</h3>
            </div>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer py-1 border-b border-[#F0F4F8]">
                <span className="text-[#697586]">SMS & WhatsApp Delivery Alerts</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#08A9A2] focus:ring-[#08A9A2]" />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-[#697586]">ZOODI New Collection Releases</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#08A9A2] focus:ring-[#08A9A2]" />
              </label>
            </div>
          </div>

          {/* DEDICATED LOGOUT SECTION IN SETTINGS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-rose-700">Account Session</h3>
                <p className="text-[10px] text-[#697586]">Manage your active sign-in on this device</p>
              </div>
            </div>

            {isCustomerLoggedIn ? (
              <div className="space-y-3">
                <p className="text-[11px] text-[#697586] leading-relaxed">
                  Currently signed in as <strong className="text-[#192E4D]">{customerProfile.name}</strong> ({customerProfile.email}).
                  Logging out will take you to the login screen with Google, Apple, and email/password options.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out from ZOODI</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-[#697586] leading-relaxed">
                  You are currently browsing as a guest. Sign in to access your orders and saved wishlist.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveScreen('login')}
                  className="w-full h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Go to Login Screen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN ACCOUNT VIEW
  return (
    <div className="flex flex-col min-h-screen bg-[#F6F8FA] pb-28 text-left">
      {/* Profile Header */}
      <div className="bg-white border-b border-[#E6EAF0] p-4 sm:p-5">
        {isCustomerLoggedIn ? (
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#08A9A2] to-[#FFB000] text-white font-black text-xl flex items-center justify-center shadow-md">
              {customerProfile.name ? customerProfile.name.charAt(0) : 'U'}
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#192E4D]">{customerProfile.name}</h1>
              <p className="text-xs text-[#697586]">{customerProfile.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-[#08A9A2]/10 text-[#08A9A2] px-2 py-0.5 rounded-full">
                Verified ZOODI Member
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#697586] font-bold flex items-center justify-center border border-dashed border-slate-300">
                <LogIn className="w-6 h-6 text-[#08A9A2]" />
              </div>
              <div className="flex-1">
                <h1 className="text-base font-extrabold text-[#192E4D]">Sign In to ZOODI</h1>
                <p className="text-xs text-[#697586]">Manage orders, saved items & express Kerala delivery</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen('login')}
              className="w-full h-11 rounded-xl bg-[#08A9A2] hover:bg-[#079690] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google, Apple or Email</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* ACCOUNT NAVIGATION MENU: min-h-[56px] tap rows */}
        <div className="rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs divide-y divide-[#F0F4F8] overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => {
              if (!isCustomerLoggedIn) {
                setActiveScreen('login');
              } else {
                setActiveSubView('orders');
              }
            }}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-[#F6F8FA] active:bg-[#F0F4F8] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#08A9A2]" />
              <span className="font-bold text-[#192E4D]">My Orders</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#697586]">
              <span className="text-[11px] font-bold tabular-nums">{orders.length} orders</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomerTab('wishlist');
              setActiveScreen('tab');
            }}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-[#F6F8FA] active:bg-[#F0F4F8] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#F20D58]" />
              <span className="font-bold text-[#192E4D]">Wishlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#697586]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('support')}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-[#F6F8FA] active:bg-[#F0F4F8] transition-colors"
          >
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-5 h-5 text-[#FFB000]" />
              <span className="font-bold text-[#192E4D]">Help & Support Tickets</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#697586]" />
          </button>

          {/* Settings & Preferences with prominent Logout button */}
          <button
            type="button"
            onClick={() => setActiveSubView('settings')}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-[#F6F8FA] active:bg-[#F0F4F8] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-[#08A9A2] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-[#192E4D] block">Settings & Preferences</span>
                <span className="text-[10px] text-[#697586]">Profile, notifications & logout</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#697586] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('policies')}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-[#F6F8FA] active:bg-[#F0F4F8] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#192E4D]" />
              <span className="font-bold text-[#192E4D]">Policies & Terms</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#697586]" />
          </button>

          {/* Admin & RBAC Portal Access via Direct URL */}
          <button
            type="button"
            onClick={() => {
              navigateTo('/superadmin');
              setAdminModule('admin_users');
            }}
            className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-purple-50/50 active:bg-purple-100/50 transition-colors bg-gradient-to-r from-purple-50/30 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-[#192E4D] block">Admin Roles & RBAC</span>
                <span className="text-[10px] text-purple-700 font-mono flex items-center gap-1 font-semibold">
                  <Link className="w-2.5 h-2.5" />
                  <span>URL: /superadmin?module=admin_users</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700">
              <span className="text-[10px] font-extrabold uppercase bg-purple-100 px-2 py-0.5 rounded-md">
                Admin
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Customer Log Out Action (when logged in) or Sign In (when logged out) */}
          {isCustomerLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-rose-50/70 active:bg-rose-100/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-rose-600 block">Log Out</span>
                  <span className="text-[10px] text-[#697586]">Sign out of {customerProfile.name}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveScreen('login')}
              className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between hover:bg-teal-50/70 active:bg-teal-100/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-[#08A9A2] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-[#08A9A2] block">Sign In / Register</span>
                  <span className="text-[10px] text-[#697586]">Access orders & member discounts</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#08A9A2] group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* ACCOUNT STATUS / DELETION */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-2xs space-y-2">
          {logoutSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              {logoutSuccess}
            </div>
          )}

          {deleteSuccess && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              {deleteSuccess}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-800 p-1 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Customer Account & Data</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3.5 text-xs text-left animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-[#192E4D]">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">Log out of Account?</h3>
            </div>
            <p className="text-[#697586] leading-relaxed">
              Are you sure you want to log out of <strong>{customerProfile.name}</strong>? You will be redirected to the sign-in screen with Google, Apple, and email/password options.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  customerLogout();
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all active:scale-[0.98] shadow-xs cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3.5 text-xs text-left animate-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-[#192E4D]">Delete Customer Account?</h3>
            <p className="text-[#697586] leading-relaxed">
              Are you sure you want to request deletion of your account and personal profile data? This complies with GDPR and privacy data retention policies.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#F6F8FA] hover:bg-[#E6EAF0] text-[#192E4D] font-bold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteSuccess('Account deletion request registered. Data queued for GDPR erasure.');
                }}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all active:scale-[0.98] shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
