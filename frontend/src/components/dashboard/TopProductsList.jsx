import React from 'react';
import { Package, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function TopProductsList({ products = [] }) {
  const { formatCurrency } = useSettings();

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Products & Services</h3>
          <p className="text-xs text-slate-500 mt-0.5">Highest volume performers</p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {products.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No sales recorded yet.
          </div>
        ) : (
          products.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500">{item.units_sold} units sold</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 font-semibold text-xs text-slate-900">
                {formatCurrency(item.revenue)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
