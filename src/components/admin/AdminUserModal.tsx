import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUser, AdminRole } from '../../types';
import {
  X,
  ShieldCheck,
  Crown,
  Package,
  ShoppingBag,
  Boxes,
  LifeBuoy,
  Sparkles,
  AlertCircle,
  Check,
  User,
  Mail,
  Building,
  Phone,
  Link,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: AdminUser | null;
  onSaveSuccess?: (name: string, isEdit: boolean) => void;
}

export interface RoleMeta {
  role: AdminRole;
  title: string;
  department: string;
  badgeClass: string;
  icon: React.ReactNode;
  summary: string;
  modulesCount: number;
}

export const ROLE_DEFINITIONS: RoleMeta[] = [
  {
    role: 'super_admin',
    title: 'Super Administrator',
    department: 'Executive / IT Ops',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <Crown className="w-3.5 h-3.5 text-purple-600" />,
    summary: 'Full root access to all 13 modules, user management, audit trails, and security settings.',
    modulesCount: 13,
  },
  {
    role: 'product_manager',
    title: 'Product & Catalog Manager',
    department: 'Merchandising & Catalog',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: <Package className="w-3.5 h-3.5 text-teal-600" />,
    summary: 'Manage products, color variants, 3-level categories, stock allocation, and reviews.',
    modulesCount: 5,
  },
  {
    role: 'order_manager',
    title: 'Order & Logistics Manager',
    department: 'Fulfillment & Operations',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />,
    summary: 'Process fulfillment lifecycles, assign couriers, manage customer records and support.',
    modulesCount: 5,
  },
  {
    role: 'inventory_manager',
    title: 'Warehouse & Inventory Manager',
    department: 'Supply Chain & Stock',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <Boxes className="w-3.5 h-3.5 text-amber-600" />,
    summary: 'Monitor SKU inventory, restock alerts, variant levels, and warehouse logistics.',
    modulesCount: 4,
  },
  {
    role: 'customer_support',
    title: 'Customer Support Lead',
    department: 'Customer Care & CRM',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />,
    summary: 'Handle support tickets, customer communications, order inquiries, and review moderation.',
    modulesCount: 5,
  },
  {
    role: 'marketing_manager',
    title: 'Growth & Marketing Lead',
    department: 'Marketing & Promotions',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <Sparkles className="w-3.5 h-3.5 text-rose-600" />,
    summary: 'Build dynamic homepage sections, manage discount coupons, featured deals, and reviews.',
    modulesCount: 5,
  },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
];

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  onSaveSuccess,
}) => {
  const { saveAdminUser } = useApp();

  const isEdit = Boolean(editingUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('product_manager');
  const [department, setDepartment] = useState('Catalog Operations');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingUser) {
      setName(editingUser.name || '');
      setEmail(editingUser.email || '');
      setRole(editingUser.role || 'product_manager');
      setDepartment(editingUser.department || 'Operations');
      setPhone(editingUser.phone || '');
      setAvatar(editingUser.avatar || PRESET_AVATARS[0]);
      setStatus(editingUser.status || 'active');
    } else {
      setName('');
      setEmail('');
      setRole('product_manager');
      setDepartment('Catalog Operations');
      setPhone('');
      setAvatar(PRESET_AVATARS[0]);
      setStatus('active');
    }
    setValidationError(null);
  }, [isOpen, editingUser]);

  if (!isOpen) return null;

  const currentRoleMeta = ROLE_DEFINITIONS.find((r) => r.role === role) || ROLE_DEFINITIONS[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setValidationError('Please enter the administrator name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setValidationError('Please enter a valid corporate email address.');
      return;
    }

    const res = saveAdminUser({
      ...(editingUser ? { id: editingUser.id } : {}),
      name: trimmedName,
      email: trimmedEmail,
      role,
      department: department.trim() || currentRoleMeta.department,
      phone: phone.trim(),
      avatar,
      status,
    });

    if (!res.success) {
      setValidationError(res.message || 'Failed to save administrator.');
      return;
    }

    if (onSaveSuccess) {
      onSaveSuccess(trimmedName, isEdit);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E6EAF0] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6EAF0] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-purple-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#192E4D]">
                {isEdit ? 'Edit Administrator Profile' : 'Provision New Administrator'}
              </h2>
              <p className="text-[11px] text-[#697586]">
                Configure corporate identity, role assignment, and access control
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Full Name & Corporate Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-[#192E4D] block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="font-extrabold text-[#192E4D] block mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@zoodi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Department & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-[#192E4D] block mb-1">Department / Unit</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Merchandising Team"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="font-extrabold text-[#192E4D] block mb-1">Internal Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. +1 555-0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="font-extrabold text-[#192E4D] block mb-1.5 uppercase text-[10px] tracking-wider">
              Assigned Administrative Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_DEFINITIONS.map((def) => {
                const isSelected = role === def.role;
                return (
                  <button
                    key={def.role}
                    type="button"
                    onClick={() => {
                      setRole(def.role);
                      if (!department || department === currentRoleMeta.department) {
                        setDepartment(def.department);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                        : 'border-[#E6EAF0] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-md bg-white border border-[#E6EAF0] shadow-2xs">
                          {def.icon}
                        </span>
                        <span className="font-extrabold text-[#192E4D] text-xs">{def.title}</span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#697586] line-clamp-2 leading-relaxed">
                      {def.summary}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-[#F0F4F8] flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span>{def.department}</span>
                      <span className="text-purple-700">{def.modulesCount} Modules</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar URL Input & Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-extrabold text-[#192E4D] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-purple-600" />
                <span>Profile Photo URL</span>
              </label>
              <span className="text-[10px] font-semibold text-[#697586]">Direct Image Link (URL)</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Preview Box */}
              <div className="relative w-11 h-11 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PRESET_AVATARS[0];
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* URL Input Field */}
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 border border-[#E6EAF0] rounded-xl text-xs font-mono text-[#192E4D] focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
                />
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full"
                    title="Clear URL"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-0.5">
                Quick Presets:
              </span>
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(url)}
                  title={`Preset ${idx + 1}`}
                  className={`relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border transition-all ${
                    avatar === url
                      ? 'border-purple-600 ring-2 ring-purple-200 scale-110 shadow-2xs'
                      : 'border-[#E6EAF0] opacity-70 hover:opacity-100 hover:border-gray-400'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Account Status Toggle */}
          <div className="p-3 rounded-2xl bg-[#F6F8FA] border border-[#E6EAF0] flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[#192E4D] block text-xs">Account Status</span>
              <span className="text-[11px] text-[#697586]">
                {status === 'active'
                  ? 'Administrator has active authentication permissions'
                  : 'Account suspended — authentication and session tokens disabled'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatus((prev) => (prev === 'active' ? 'suspended' : 'active'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-100 text-rose-700 border border-rose-300'
              }`}
            >
              {status === 'active' ? 'Active' : 'Suspended'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              All administrator actions are timestamped and permanently recorded in the immutable ZOODI Audit
              Trail. Initial password for sandbox test accounts: <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-purple-200">admin123</code>.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E6EAF0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-[#E6EAF0] hover:bg-gray-100 font-bold text-[#697586] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Provision Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
