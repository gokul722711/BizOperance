import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  FileSpreadsheet,
  Download,
  Loader2,
} from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';

export default function ReportsPage() {
  const { formatCurrency } = useSettings();

  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await analyticsApi.getOverview(selectedRange);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational intelligence, sales trends, and dataset exports
          </p>
        </div>

        {/* Range Selector & Global Exports */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  range === r
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={analyticsApi.exportUrl('orders')}
              download
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Export complete orders dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Orders CSV
            </a>
            <a
              href={analyticsApi.exportUrl('products')}
              download
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Export catalog inventory dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" /> Products CSV
            </a>
            <a
              href={analyticsApi.exportUrl('customers')}
              download
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Export customer accounts dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" /> Customers CSV
            </a>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-500">Generating analytics metrics...</span>
        </div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Period Revenue</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(metrics.total_revenue || 0)}
              </div>
              <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{metrics.revenue_growth || 0}% vs prior window</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400">Transaction Volume</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.total_orders || 0} orders
              </div>
              <div className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+{metrics.orders_growth || 0}% order growth</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400">Average Order Value</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(metrics.average_order_value || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-2">Per completed order</div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400">Customer Base</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics.total_customers || 0} clients
              </div>
              <div className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>+{metrics.new_customers || 0} acquired in period</span>
              </div>
            </div>
          </div>

          {/* Revenue and Order Volume Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Completed order revenue over time</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenue_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevRep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevRep)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Volume Trend */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Order Count Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Daily operational order counts</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.revenue_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, 'Orders']} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Product Performance and Status Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Performance Ranking */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Product & Service Performance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sales volume and gross revenue ranking for selected period</p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Rank</th>
                      <th className="px-4 py-2.5">Product / Service</th>
                      <th className="px-4 py-2.5 text-center">Units Sold</th>
                      <th className="px-4 py-2.5 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.product_performance?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                          No product transactions recorded for this timeframe.
                        </td>
                      </tr>
                    ) : (
                      data?.product_performance?.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                              {p.units_sold}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Order Fulfillment Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Status breakdown in selected window</p>
              </div>

              <div className="space-y-3 my-6">
                {data?.status_distribution?.map((item) => {
                  let barColor = 'bg-slate-400';
                  if (item.status === 'completed') barColor = 'bg-emerald-500';
                  if (item.status === 'processing') barColor = 'bg-blue-500';
                  if (item.status === 'pending') barColor = 'bg-amber-500';
                  if (item.status === 'cancelled') barColor = 'bg-rose-500';

                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="text-slate-500">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500">
                Data generated live from operational transaction records.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
