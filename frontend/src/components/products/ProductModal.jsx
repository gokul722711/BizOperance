import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { productsApi } from '../../api/endpoints';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export default function ProductModal({ isOpen, onClose, product, onProductSaved }) {
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    unit_price: '',
    stock_quantity: 0,
    low_stock_threshold: settings?.low_stock_threshold_default || 10,
    is_available: true,
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'General',
        unit_price: product.unit_price || '',
        stock_quantity: product.stock_quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 10,
        is_available: product.is_available ?? true,
        description: product.description || '',
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'Services',
        unit_price: '',
        stock_quantity: 10,
        low_stock_threshold: settings?.low_stock_threshold_default || 10,
        is_available: true,
        description: '',
      });
    }
  }, [product, isOpen, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.unit_price) {
      showToast('Please fill all required product details', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
      };

      if (product) {
        await productsApi.update(product.id, payload);
        showToast(`Product '${formData.name}' updated successfully!`, 'success');
      } else {
        await productsApi.create(payload);
        showToast(`Product '${formData.name}' created successfully!`, 'success');
      }
      onProductSaved();
      onClose();
    } catch (err) {
      showToast('Error saving product: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product / Service' : 'Add New Product or Service'}
      subtitle="Configure pricing, inventory thresholds, and catalog category"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Product / Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ergonomic Office Desk or Advisory Service"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              SKU Code *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. HW-DSK-01"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Hardware, Consulting, Cloud"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Unit Price ({settings?.currency_symbol || '$'}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              placeholder="0.00"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Initial Stock Units
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={formData.low_stock_threshold}
              onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="is_available" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Available for Ordering
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief product notes or service scope..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" /> {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
