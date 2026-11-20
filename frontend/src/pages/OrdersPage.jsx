import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ShoppingCart,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import CreateOrderModal from '../components/orders/CreateOrderModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { ordersApi, analyticsApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';

export default function OrdersPage() {
  const { formatCurrency } = useSettings();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
      };
      const res = await ordersApi.list(params);
      const data = res.data;
      if (data.results) {
        setOrders(data.results);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 50) || 1);
      } else {
        setOrders(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewOrder = (id) => {
    setSelectedOrderId(id);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: 'order_number',
      render: (row) => (
        <span className="font-bold text-slate-900">{row.order_number}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.customer_name}</div>
          <div className="text-[11px] text-slate-400">{row.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'order_date',
      render: (row) => (
        <span className="text-slate-500">
          {row.order_date ? new Date(row.order_date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Items',
      accessor: 'items_count',
      align: 'center',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
          {row.items_count || 1}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: 'total_amount',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      header: 'Payment',
      accessor: 'payment_status',
      align: 'center',
      render: (row) => <StatusBadge status={row.payment_status} type="payment" />,
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} type="order" />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleViewOrder(row.id)}
          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold text-xs flex items-center gap-1 transition-colors ml-auto"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Orders & Transactions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage transactions, create client orders, and track fulfillment status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={analyticsApi.exportUrl('orders')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, notes..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Order Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyTitle="No orders found"
        emptyMessage="Try adjusting your search criteria or create a new order."
        emptyIcon={ShoppingCart}
        pagination={{
          page,
          totalPages,
          totalCount,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onOrderCreated={() => {
          fetchOrders();
        }}
      />

      {/* View Order Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onOrderUpdated={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
