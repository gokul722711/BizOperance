import React from 'react';
import {
  Clock,
  ShoppingCart,
  UserPlus,
  Package,
  CheckSquare,
  Settings,
} from 'lucide-react';

export default function RecentActivityFeed({ activities = [] }) {
  const getIcon = (actionType) => {
    switch (actionType) {
      case 'order_created':
      case 'order_status_updated':
      case 'order_cancelled':
        return { icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' };
      case 'customer_added':
      case 'customer_updated':
        return { icon: UserPlus, color: 'text-emerald-600 bg-emerald-50' };
      case 'stock_adjusted':
      case 'product_created':
        return { icon: Package, color: 'text-purple-600 bg-purple-50' };
      case 'task_created':
      case 'task_completed':
        return { icon: CheckSquare, color: 'text-amber-600 bg-amber-50' };
      default:
        return { icon: Settings, color: 'text-slate-600 bg-slate-100' };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological system operations</p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No activity logs found.
          </div>
        ) : (
          activities.map((act) => {
            const { icon: Icon, color } = getIcon(act.action_type);
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">{act.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTimestamp(act.created_at)}
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{act.description}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
