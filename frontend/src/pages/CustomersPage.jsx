import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Users,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
} from 'lucide-react';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomerModal from '../components/customers/CustomerModal';
import CustomerDetailModal from '../components/customers/CustomerDetailModal';
import { customersApi, analyticsApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function CustomersPage() {
  const { formatCurrency } = useSettings();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailCustomerId, setDetailCustomerId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersApi.list({
        search: search.trim() || undefined,
        customer_type: typeFilter || undefined,
        page_size: 100,
      });
      setCustomers(res.data?.results || res.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleEdit = (cust) => {
    setSelectedCustomer(cust);
    setCustomerModalOpen(true);
  };

  const handleView = (cust) => {
    setDetailCustomerId(cust.id);
    setDetailModalOpen(true);
  };

  const handleDeletePrompt = (cust) => {
    setDeletingCustomer(cust);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    setDeleting(true);
    try {
      await customersApi.delete(deletingCustomer.id);
      showToast(`Customer '${deletingCustomer.name}' removed`, 'success');
      setDeleteConfirmOpen(false);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast('Failed to delete customer: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <span className="text-slate-600">{row.phone || '—'}</span>
      ),
    },
    {
      header: 'Account Type',
      accessor: 'customer_type',
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            row.customer_type === 'business'
              ? 'bg-indigo-50 text-indigo-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.customer_type}
        </span>
      ),
    },
    {
      header: 'Total Orders',
      accessor: 'total_orders',
      align: 'center',
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.total_orders || 0}</span>
      ),
    },
    {
      header: 'Total Spent',
      accessor: 'total_spent',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.total_spent || 0)}</span>
      ),
    },
    {
      header: 'Last Activity',
      accessor: 'last_activity_date',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.last_activity_date ? new Date(row.last_activity_date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold text-xs flex items-center gap-1 transition-colors"
            title="View Profile"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Edit Customer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeletePrompt(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized directory of individual and business client accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={analyticsApi.exportUrl('customers')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setCustomerModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Account Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyTitle="No customers found"
        emptyMessage="Try adjusting your search criteria or register a new client."
        emptyIcon={Users}
      />

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        customer={selectedCustomer}
        onCustomerSaved={fetchCustomers}
      />

      {/* Customer Profile Details Modal */}
      {detailCustomerId && (
        <CustomerDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setDetailCustomerId(null);
          }}
          customerId={detailCustomerId}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Customer ${deletingCustomer?.name}?`}
        message="Are you sure you want to delete this customer account? Associated orders will be affected."
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}
