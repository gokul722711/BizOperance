import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { dashboardApi, ordersApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';
import StatCard from '../components/common/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrderStatusChart from '../components/dashboard/OrderStatusChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import TopProductsList from '../components/dashboard/TopProductsList';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import OrderDetailModal from '../components/orders/OrderDetailModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // View order modal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const fetchDashboardData = async (selectedRange = range, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await dashboardApi.getOverview(selectedRange);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setOrderModalOpen(true);
  };

  if (loading && !data) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium text-slate-500">Loading operations dashboard...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Banner if triggered */}
      {kpis.low_stock_alert_count > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Low Inventory Warning ({kpis.low_stock_alert_count} items)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Certain catalog products have reached or fallen below the minimum safety threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-white border border-amber-200 rounded-xl hover:bg-amber-100/50 transition-colors self-start sm:self-auto"
          >
            Review Inventory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(kpis.total_revenue || 0)}
          subtitle="From completed orders"
          trend="+14.2% vs last period"
          trendDirection="up"
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Orders"
          value={kpis.total_orders || 0}
          subtitle="All recorded transactions"
          trend="+8.5% volume"
          trendDirection="up"
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Active Customers"
          value={kpis.active_customers || 0}
          subtitle="Customers with orders"
          trend="+5 new this month"
          trendDirection="up"
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Pending Orders"
          value={kpis.pending_orders || 0}
          subtitle="Pending or in-process"
          trend="Action required"
          trendDirection="neutral"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={data?.revenue_chart || []}
            range={range}
            onRangeChange={(r) => setRange(r)}
          />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart statusOverview={data?.order_status_overview || []} />
        </div>
      </div>

      {/* Operations Activity & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable
            orders={data?.recent_orders || []}
            onViewOrder={handleViewOrder}
          />
        </div>
        <div className="lg:col-span-1">
          <TopProductsList products={data?.top_products || []} />
        </div>
      </div>

      {/* Recent Activity Log */}
      <div>
        <RecentActivityFeed activities={data?.recent_activity || []} />
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          isOpen={orderModalOpen}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onOrderUpdated={() => fetchDashboardData(range, true)}
        />
      )}
    </div>
  );
}
