import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Package,
  Layers,
  Edit2,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProductModal from '../components/products/ProductModal';
import AdjustStockModal from '../components/products/AdjustStockModal';
import { productsApi, analyticsApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export default function ProductsPage() {
  const { formatCurrency } = useSettings();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, sumRes] = await Promise.all([
        productsApi.list({
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
          stock_status: stockStatusFilter || undefined,
          page_size: 100,
        }),
        productsApi.categories(),
        productsApi.summary(),
      ]);

      setProducts(prodRes.data?.results || prodRes.data || []);
      setCategories(catRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, stockStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleEdit = (prod) => {
    setSelectedProduct(prod);
    setProductModalOpen(true);
  };

  const handleAdjust = (prod) => {
    setAdjustProduct(prod);
    setAdjustModalOpen(true);
  };

  const handleDeletePrompt = (prod) => {
    setDeletingProduct(prod);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await productsApi.delete(deletingProduct.id);
      showToast(`Product '${deletingProduct.name}' deleted successfully`, 'success');
      setDeleteConfirmOpen(false);
      setDeletingProduct(null);
      fetchData();
    } catch (err) {
      showToast('Failed to delete product: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Product Name & SKU',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Unit Price',
      accessor: 'unit_price',
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.unit_price)}</span>
      ),
    },
    {
      header: 'Stock Units',
      accessor: 'stock_quantity',
      align: 'center',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">{row.stock_quantity}</span>
          <span className="text-[10px] text-slate-400 block">min: {row.low_stock_threshold}</span>
        </div>
      ),
    },
    {
      header: 'Stock Status',
      accessor: 'stock_status',
      align: 'center',
      render: (row) => <StatusBadge status={row.stock_status} type="stock" />,
    },
    {
      header: 'Availability',
      accessor: 'is_available',
      align: 'center',
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            row.is_available
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.is_available ? 'Available' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleAdjust(row)}
            className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold text-xs flex items-center gap-1 transition-colors"
            title="Adjust Stock Units"
          >
            <Layers className="w-3.5 h-3.5" /> Adjust
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeletePrompt(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Product"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Products & Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your service and product catalog, stock counts, and reorder levels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={analyticsApi.exportUrl('products')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </a>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Inventory Overview Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Catalog</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total_products}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Units</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total_units}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-amber-600">Low Stock</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{summary.low_stock_count}</div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase text-rose-600">Out of Stock</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{summary.out_of_stock_count}</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        emptyTitle="No products found"
        emptyMessage="Try adjusting your filters or add a new product."
        emptyIcon={Package}
      />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={selectedProduct}
        onProductSaved={fetchData}
      />

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={adjustProduct}
        onStockAdjusted={fetchData}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Product ${deletingProduct?.name}?`}
        message="Are you sure you want to remove this item from your catalog? Existing historical orders will retain their line item descriptions."
        confirmText="Confirm Delete"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
}
