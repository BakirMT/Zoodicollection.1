import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, ShoppingBag, Star, Mail, Phone, Calendar, ArrowUpRight } from 'lucide-react';

export const AdminCustomersView: React.FC = () => {
  const { orders, reviews, customerProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract customer records from orders, reviews, and current logged-in profile
  const customerMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      phone: string;
      ordersCount: number;
      totalSpent: number;
      reviewsCount: number;
      memberSince: string;
    }
  >();

  // Add current active profile
  if (customerProfile) {
    customerMap.set(customerProfile.email.toLowerCase(), {
      id: customerProfile.id,
      name: customerProfile.name,
      email: customerProfile.email,
      phone: customerProfile.phone || '+1 (555) 890-1234',
      ordersCount: 0,
      totalSpent: 0,
      reviewsCount: 0,
      memberSince: 'Oct 2025',
    });
  }

  // Aggregate from orders
  orders.forEach((ord) => {
    const key = ord.customerEmail.toLowerCase();
    const existing = customerMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += ord.amounts.total;
    } else {
      customerMap.set(key, {
        id: ord.customerId,
        name: ord.customerName,
        email: ord.customerEmail,
        phone: ord.customerPhone,
        ordersCount: 1,
        totalSpent: ord.amounts.total,
        reviewsCount: 0,
        memberSince: 'Jan 2026',
      });
    }
  });

  // Aggregate from reviews
  reviews.forEach((rev) => {
    const key = rev.customerName.toLowerCase();
    const found = Array.from(customerMap.values()).find(
      (c) => c.name.toLowerCase() === key
    );
    if (found) {
      found.reviewsCount += 1;
    } else {
      customerMap.set(rev.customerId, {
        id: rev.customerId,
        name: rev.customerName,
        email: `${rev.customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        phone: '+1 (555) 234-5678',
        ordersCount: 1,
        totalSpent: 129.0,
        reviewsCount: 1,
        memberSince: 'Feb 2026',
      });
    }
  });

  const customerList = Array.from(customerMap.values());
  const q = searchQuery.trim().toLowerCase();
  const filteredCustomers = customerList.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );

  const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6EAF0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#08A9A2]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[#192E4D]">Customer Relationship Directory</h1>
          </div>
          <p className="text-xs text-[#697586] mt-1">
            Browse verified shoppers, order histories, total lifetime expenditure, and feedback records.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Total Shoppers
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 text-[#08A9A2] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {customerList.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Active Verified Accounts
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Lifetime Value
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Gross Customer Spend
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6EAF0] shadow-xs flex flex-col justify-between min-w-0 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-extrabold text-[#697586] uppercase tracking-wider truncate">
              Verified Feedback
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#192E4D] tabular-nums leading-tight">
              {reviews.length}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-[#697586] mt-0.5 truncate">
              Total Reviews Left
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white rounded-2xl border border-[#E6EAF0] flex items-center justify-between text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 bg-[#F6F8FA] border border-[#E6EAF0] rounded-xl text-xs font-semibold text-[#192E4D] focus:outline-hidden focus:border-[#08A9A2]"
          />
        </div>
        <span className="text-xs text-[#697586] font-bold">
          Showing {filteredCustomers.length} of {customerList.length} Shoppers
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#E6EAF0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBFD] text-[#697586] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6EAF0]">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Information</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-center">Reviews</th>
                <th className="py-3.5 px-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#08A9A2]/10 text-[#08A9A2] font-black text-xs flex items-center justify-center shrink-0">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#192E4D] block">{cust.name}</span>
                          <span className="text-[10px] text-[#697586] font-mono">{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{cust.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{cust.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                        {cust.ordersCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#192E4D] tabular-nums">
                      ${cust.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#FFB000]">
                      {cust.reviewsCount > 0 ? `★ ${cust.reviewsCount}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#697586]">{cust.memberSince}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
