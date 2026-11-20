import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const s = String(status).toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (type === 'order' || type === 'status') {
    switch (s) {
      case 'completed':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        label = 'Completed';
        break;
      case 'processing':
        styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
        label = 'Processing';
        break;
      case 'pending':
        styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
        label = 'Pending';
        break;
      case 'cancelled':
        styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
        label = 'Cancelled';
        break;
      default:
        break;
    }
  }

  if (type === 'payment') {
    switch (s) {
      case 'paid':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        label = 'Paid';
        break;
      case 'pending':
        styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
        label = 'Pending';
        break;
      case 'partially_paid':
        styles = 'bg-purple-50 text-purple-700 border-purple-200/80';
        label = 'Partially Paid';
        break;
      default:
        break;
    }
  }

  if (type === 'stock') {
    switch (s) {
      case 'in_stock':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        label = 'In Stock';
        break;
      case 'low_stock':
        styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
        label = 'Low Stock';
        break;
      case 'out_of_stock':
        styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
        label = 'Out of Stock';
        break;
      default:
        break;
    }
  }

  if (type === 'priority') {
    switch (s) {
      case 'high':
        styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
        label = 'High Priority';
        break;
      case 'medium':
        styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
        label = 'Medium';
        break;
      case 'low':
        styles = 'bg-slate-100 text-slate-700 border-slate-200/80';
        label = 'Low';
        break;
      default:
        break;
    }
  }

  if (type === 'task') {
    switch (s) {
      case 'completed':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        label = 'Completed';
        break;
      case 'in_progress':
        styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
        label = 'In Progress';
        break;
      case 'todo':
        styles = 'bg-slate-100 text-slate-700 border-slate-200/80';
        label = 'To Do';
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
}
