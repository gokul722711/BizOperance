import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { useSettings } from '../../context/SettingsContext';

export default function RecentOrdersTable({ orders = [], onViewOrder }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Orders</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest transactional activities</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 border-b border-slate-100 uppercase font-semibold text-[11px] text-slate-500 tracking-wider">
            <tr>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-slate-400 text-xs">
                  No recent orders available.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{ord.order_number}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800 truncate max-w-[140px]">
                      {ord.customer_name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{ord.order_date}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {formatCurrency(ord.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge status={ord.status} type="order" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onViewOrder && onViewOrder(ord.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
