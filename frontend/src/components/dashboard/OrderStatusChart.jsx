import React from 'react';

export default function OrderStatusChart({ statusOverview = [] }) {
  const total = statusOverview.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Order Status Overview</h3>
        <p className="text-xs text-slate-500 mt-0.5">Distribution across {total} total orders</p>
      </div>

      {/* Stacked Progress Bar */}
      <div className="my-6">
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {statusOverview.map((item) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={item.status}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Legend & Numbers */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        {statusOverview.map((item) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          return (
            <div key={item.status} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-600 truncate">{item.label}</span>
              </div>
              <div className="flex items-baseline justify-between pl-4.5">
                <span className="text-base font-bold text-slate-900">{item.count}</span>
                <span className="text-[11px] text-slate-400 font-medium">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
