import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUser, AdminRole } from '../../types';
import { hasAdminPermission, AdminModule } from '../../lib/commerceLogic';
import { AdminUserModal, ROLE_DEFINITIONS } from '../../components/admin/AdminUserModal';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Crown,
  Package,
  ShoppingBag,
  Boxes,
  LifeBuoy,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Layers,
  History,
  Tag,
  Star,
  Users,
  LayoutDashboard,
  FileCode2,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Link,
  Copy,
  Check,
} from 'lucide-react';

interface AdminRbacViewProps {
  showNotice: (message?: string, type?: 'success' | 'error') => void;
}

const ALL_MODULES: { id: AdminModule; label: string; icon: React.ReactNode; category: string }[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, category: 'Core' },
  { id: 'products', label: 'Products & Variants', icon: <Package className="w-3.5 h-3.5" />, category: 'Catalog' },
  { id: 'categories', label: '3-Level Categories', icon: <Layers className="w-3.5 h-3.5" />, category: 'Catalog' },
  { id: 'homepage_builder', label: 'Homepage Builder', icon: <Sparkles className="w-3.5 h-3.5" />, category: 'Marketing' },
  { id: 'orders', label: 'Orders & Fulfillment', icon: <ShoppingBag className="w-3.5 h-3.5" />, category: 'Logistics' },
  { id: 'inventory', label: 'Variant Inventory', icon: <Boxes className="w-3.5 h-3.5" />, category: 'Logistics' },
  { id: 'coupons_marketing', label: 'Coupons & Deals', icon: <Tag className="w-3.5 h-3.5" />, category: 'Marketing' },
  { id: 'customers', label: 'Customer Directory', icon: <Users className="w-3.5 h-3.5" />, category: 'CRM' },
  { id: 'reviews', label: 'Reviews Moderation', icon: <Star className="w-3.5 h-3.5" />, category: 'Community' },
  { id: 'support', label: 'Support Tickets', icon: <LifeBuoy className="w-3.5 h-3.5" />, category: 'Support' },
  { id: 'admin_users', label: 'Admin Roles & RBAC', icon: <ShieldCheck className="w-3.5 h-3.5" />, category: 'Security' },
  { id: 'audit_logs', label: 'Security Audit Trail', icon: <History className="w-3.5 h-3.5" />, category: 'Security' },
];

export const AdminRbacView: React.FC<AdminRbacViewProps> = ({ showNotice }) => {
  const {
    adminUsers,
    currentAdmin,
    deleteAdminUser,
    switchAdminUser,
    toggleAdminUserStatus,
    setAdminModule,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'directory' | 'matrix' | 'profiles' | 'sandbox'>('directory');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Sync activeTab from URL search params on mount
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['directory', 'matrix', 'profiles', 'sandbox'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTabChange = (tab: 'directory' | 'matrix' | 'profiles' | 'sandbox') => {
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('module', 'admin_users');
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleCopyUrl = () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/superadmin?module=admin_users${activeTab !== 'directory' ? `&tab=${activeTab}` : ''}`;
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      showNotice('Direct URL copied to clipboard: ' + url, 'success');
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      showNotice('Direct URL copied!', 'success');
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Sandbox testing state
  const [sandboxRole, setSandboxRole] = useState<AdminRole>(currentAdmin?.role || 'product_manager');

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Counts
  const superAdminCount = adminUsers.filter((u) => u.role === 'super_admin').length;
  const managerCount = adminUsers.filter((u) =>
    ['product_manager', 'order_manager', 'inventory_manager', 'marketing_manager'].includes(u.role)
  ).length;
  const supportCount = adminUsers.filter((u) => u.role === 'customer_support').length;

  // Filtered users
  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = adminUsers.filter((u) => {
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'active' && u.status !== 'suspended') ||
      (selectedStatusFilter === 'suspended' && u.status === 'suspended');

    return matchesQuery && matchesRole && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteAdminUser(userToDelete.id);
    if (res.success) {
      showNotice(`Administrator ${userToDelete.name} has been revoked and removed.`, 'success');
    } else {
      showNotice(res.message || 'Cannot delete administrator account.', 'error');
    }
    setUserToDelete(null);
  };

  const handleSimulate = (userId: string, name: string) => {
    const res = switchAdminUser(userId);
    if (res.success) {
      showNotice(`Active session switched to ${name}. Role permissions updated.`, 'success');
    } else {
      showNotice(res.message || 'Cannot switch session.', 'error');
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <Crown className="w-3 h-3 text-purple-600" />
            <span>Super Admin</span>
          </span>
        );
      case 'product_manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
            <Package className="w-3 h-3 text-teal-600" />
            <span>Product Lead</span>
          </span>
        );
      case 'order_manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-blue-600" />
            <span>Order Manager</span>
          </span>
        );
      case 'inventory_manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Boxes className="w-3 h-3 text-amber-600" />
            <span>Inventory Lead</span>
          </span>
        );
      case 'customer_support':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <LifeBuoy className="w-3 h-3 text-emerald-600" />
            <span>Customer Support</span>
          </span>
        );
      case 'marketing_manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-600" />
            <span>Marketing Lead</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gray-100 text-gray-700">
            {role}
          </span>
        );
    }
  };

  const getAccessibleModulesCount = (role: AdminRole) => {
    return ALL_MODULES.filter((m) => hasAdminPermission(role, m.id)).length;
  };

  return (
    <div className="space-y-4">
      {/* EXECUTIVE RBAC HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6EAF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[#192E4D]">
              Admin Roles & Access Control (RBAC)
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
              Enforced Active
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Manage corporate administrator accounts, define granular module permissions, inspect access
            matrices, and simulate roles.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminModule('audit_logs')}
            className="h-10 px-3.5 rounded-xl border border-[#E6EAF0] hover:bg-[#F6F8FA] text-[#192E4D] text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Inspect Immutable Security Audit Logs"
          >
            <History className="w-4 h-4 text-[#697586]" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* DIRECT ACCESS URL & DEEP LINK BANNER */}
      <div className="bg-purple-50/70 border border-purple-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Link className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-[#192E4D] text-xs">Direct Page URL:</span>
              <code className="px-2 py-0.5 rounded-lg bg-white border border-purple-200 text-purple-700 font-mono text-[11px] font-bold select-all truncate">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/superadmin?module=admin_users${activeTab !== 'directory' ? `&tab=${activeTab}` : ''}`
                  : '/superadmin?module=admin_users'}
              </code>
            </div>
            <p className="text-[10px] text-[#697586] mt-0.5">
              Access and bookmark this Admin Roles & RBAC page directly in your browser.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyUrl}
          className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto ${
            copiedUrl
              ? 'bg-emerald-600 text-white'
              : 'bg-white hover:bg-purple-100/60 text-purple-800 border border-purple-200'
          }`}
        >
          {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Direct URL'}</span>
        </button>
      </div>

      {/* METRIC COUNTERS (Vertical layout, no text overflow) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Total Admins */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Administrators
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {adminUsers.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Registered Accounts
            </div>
          </div>
        </div>

        {/* Card 2: Super Admins */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Root Access
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 tabular-nums leading-tight">
              {superAdminCount}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Super Administrators
            </div>
          </div>
        </div>

        {/* Card 3: Department Leads */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Dept. Managers
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {managerCount}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Catalog & Ops Leads
            </div>
          </div>
        </div>

        {/* Card 4: Support Staff */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Support & CRM
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {supportCount}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Support Specialists
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="bg-white rounded-2xl border border-[#E6EAF0] p-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('directory')}
            className={`h-8 px-3.5 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D] hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Administrators ({adminUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('matrix')}
            className={`h-8 px-3.5 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D] hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permissions Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('profiles')}
            className={`h-8 px-3.5 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'profiles'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D] hover:bg-gray-100'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Role Definitions (6)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('sandbox')}
            className={`h-8 px-3.5 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#697586] hover:text-[#192E4D] hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Role Sandbox & Simulator</span>
          </button>
        </div>

        {/* Current Active User Session Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-[#E6EAF0] rounded-xl text-[11px]">
          <span className="text-[#697586]">Active Session:</span>
          <span className="font-extrabold text-[#192E4D]">{currentAdmin?.name || 'Super Admin'}</span>
          <span className="text-purple-700 font-mono font-bold">({currentAdmin?.role || 'super_admin'})</span>
        </div>
      </div>

      {/* TAB 1: ADMINISTRATORS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="p-3 bg-white rounded-2xl border border-[#E6EAF0] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-[#F6F8FA] border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-purple-600"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-[#FAFBFD] focus:outline-hidden"
                >
                  <option value="all">All Roles ({adminUsers.length})</option>
                  <option value="super_admin">Super Administrators</option>
                  <option value="product_manager">Product Managers</option>
                  <option value="order_manager">Order Managers</option>
                  <option value="inventory_manager">Inventory Managers</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="marketing_manager">Marketing Leads</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[#E6EAF0] text-xs font-bold text-[#192E4D] bg-[#FAFBFD] focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>

          {/* Administrators Table */}
          <div className="bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBFD] text-[#697586] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6EAF0]">
                  <tr>
                    <th className="py-3.5 px-4">Administrator Profile</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Access Scope</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F8]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No administrators found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isCurrent = currentAdmin?.id === user.id;
                      const accessibleCount = getAccessibleModulesCount(user.role);
                      const isSuspended = user.status === 'suspended';

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Profile */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#E6EAF0] bg-purple-50">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-black text-purple-700 text-xs">
                                    {user.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                {isCurrent && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-[#192E4D] text-xs">{user.name}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[9px] font-black uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#697586] font-mono block">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">{getRoleBadge(user.role)}</td>

                          {/* Department */}
                          <td className="py-3 px-4 font-semibold text-[#192E4D]">
                            {user.department || 'Operations'}
                          </td>

                          {/* Access Scope */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#697586] mb-1">
                                <span>{accessibleCount} of 12 Modules</span>
                                <span className="font-mono">{Math.round((accessibleCount / 12) * 100)}%</span>
                              </div>
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    user.role === 'super_admin' ? 'bg-purple-600' : 'bg-teal-500'
                                  }`}
                                  style={{ width: `${(accessibleCount / 12) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-4 text-[11px] text-[#697586] font-medium">
                            {user.lastActive || 'Recently'}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSuspended
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Simulate Role */}
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulate(user.id, user.name)}
                                  className="h-8 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center gap-1 active:scale-95"
                                  title="Test-drive dashboard as this administrator"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Simulate</span>
                                </button>
                              )}

                              {/* Toggle Status */}
                              <button
                                type="button"
                                onClick={() => toggleAdminUserStatus(user.id)}
                                disabled={isCurrent && user.role === 'super_admin'}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={isSuspended ? 'Activate account' : 'Suspend account'}
                              >
                                {isSuspended ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Edit Profile */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#192E4D] transition-colors"
                                title="Edit Administrator Profile"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setUserToDelete(user)}
                                disabled={isCurrent}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title={isCurrent ? 'Cannot delete your active account' : 'Revoke & Delete Administrator'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E6EAF0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#192E4D]">Granular RBAC Module Permissions Matrix</h2>
                <p className="text-xs text-[#697586]">
                  Cross-reference module access across all 6 administrative roles. Enforced in real-time by{' '}
                  <code className="text-purple-700 font-mono font-bold">hasAdminPermission(role, module)</code>.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Permitted
                </span>
                <span className="flex items-center gap-1 text-gray-400 font-bold">
                  <XCircle className="w-4 h-4 text-gray-300" /> Restricted
                </span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E6EAF0] rounded-xl overflow-hidden">
                <thead className="bg-[#FAFBFD] text-[#697586] text-[10px] uppercase font-black tracking-wider border-b border-[#E6EAF0]">
                  <tr>
                    <th className="py-3 px-3 w-48 border-r border-[#E6EAF0]">System Module</th>
                    {ROLE_DEFINITIONS.map((r) => (
                      <th key={r.role} className="py-3 px-2.5 text-center border-r border-[#E6EAF0] last:border-r-0">
                        <div className="font-extrabold text-[#192E4D]">{r.title}</div>
                        <div className="text-[9px] text-[#697586] lowercase font-mono">@{r.role}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F8]">
                  {ALL_MODULES.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Module info */}
                      <td className="py-2.5 px-3 border-r border-[#E6EAF0]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#F6F8FA] text-[#192E4D]">{mod.icon}</span>
                          <div>
                            <span className="font-extrabold text-[#192E4D] block">{mod.label}</span>
                            <span className="text-[10px] text-gray-400">{mod.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Checkmarks */}
                      {ROLE_DEFINITIONS.map((r) => {
                        const permitted = hasAdminPermission(r.role, mod.id);
                        return (
                          <td
                            key={r.role}
                            className={`py-2.5 px-2.5 text-center border-r border-[#E6EAF0] last:border-r-0 ${
                              permitted ? 'bg-emerald-50/30' : ''
                            }`}
                          >
                            {permitted ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-300">
                                <XCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE DEFINITIONS & POLICIES */}
      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_DEFINITIONS.map((r) => {
            const members = adminUsers.filter((u) => u.role === r.role);
            return (
              <div
                key={r.role}
                className="p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                      {r.icon}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${r.badgeClass}`}>
                      {r.modulesCount} of 12 Modules
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#192E4D]">{r.title}</h3>
                  <span className="text-[11px] font-bold text-purple-700 block mt-0.5">{r.department}</span>
                  <p className="text-xs text-[#697586] mt-2 leading-relaxed">{r.summary}</p>
                </div>

                {/* Assigned Users in this Role */}
                <div className="pt-3 border-t border-[#F0F4F8]">
                  <span className="text-[10px] font-extrabold uppercase text-[#697586] tracking-wider block mb-1.5">
                    Assigned Staff ({members.length})
                  </span>
                  {members.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic">No administrators currently assigned.</span>
                  ) : (
                    <div className="space-y-1">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#192E4D]">{m.name}</span>
                          <span className="text-[10px] text-[#697586] font-mono">{m.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: LIVE ROLE SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="p-5 bg-white rounded-2xl border border-[#E6EAF0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F4F8]">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#192E4D]">Live Role Sandbox & Preview</h2>
              <p className="text-xs text-[#697586]">
                Select any administrative role to preview what permissions and sidebar options are visible.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#192E4D]">Simulate Role:</label>
              <select
                value={sandboxRole}
                onChange={(e) => setSandboxRole(e.target.value as AdminRole)}
                className="h-9 px-3 rounded-xl border border-purple-300 text-xs font-extrabold text-purple-800 bg-purple-50 focus:outline-hidden"
              >
                {ROLE_DEFINITIONS.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sandbox Visual Layout: Simulated Sidebar & Authorized Access */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Simulated Sidebar */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-[#E6EAF0] space-y-1">
              <span className="text-[10px] font-extrabold text-[#697586] uppercase tracking-wider block mb-2 px-2">
                Simulated Sidebar Menu
              </span>
              {ALL_MODULES.map((mod) => {
                const permitted = hasAdminPermission(sandboxRole, mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      permitted
                        ? 'bg-white text-[#192E4D] border border-[#E6EAF0] shadow-2xs'
                        : 'bg-transparent text-gray-400 opacity-40 line-through'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mod.icon}
                      <span>{mod.label}</span>
                    </div>
                    {permitted ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sandbox Details & Allowed Operations */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-purple-900">
                    Policy Scope for {ROLE_DEFINITIONS.find((r) => r.role === sandboxRole)?.title}
                  </h3>
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  {ROLE_DEFINITIONS.find((r) => r.role === sandboxRole)?.summary}
                </p>
              </div>

              {/* Accessible Modules Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#192E4D] uppercase tracking-wider">
                  Permitted Modules & Action Powers ({getAccessibleModulesCount(sandboxRole)} of 12)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ALL_MODULES.filter((m) => hasAdminPermission(sandboxRole, m.id)).map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restricted Modules */}
              <div className="space-y-2 pt-2 border-t border-[#F0F4F8]">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                  Restricted Modules (Access Blocked)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ALL_MODULES.filter((m) => !hasAdminPermission(sandboxRole, m.id)).map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 flex items-center gap-2 opacity-75"
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E6EAF0] space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#192E4D]">Revoke Administrator Access</h3>
                <span className="text-xs text-rose-600 font-semibold">Irreversible security action</span>
              </div>
            </div>

            <p className="text-xs text-[#697586] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#192E4D]">{userToDelete.name}</strong> (
              <span className="font-mono">{userToDelete.email}</span>)? Their active tokens will be invalidated and
              they will no longer have access to the ZOODI administration portal.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="h-10 px-4 rounded-xl border border-[#E6EAF0] text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold transition-all"
              >
                Revoke & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        onSaveSuccess={(name, isEdit) => {
          showNotice(
            isEdit
              ? `Administrator ${name} has been updated.`
              : `Administrator ${name} has been successfully provisioned.`,
            'success'
          );
        }}
      />
    </div>
  );
};
