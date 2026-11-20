import React, { useState } from 'react';
import { Layers, Plus, Minus, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { productsApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

export default function AdjustStockModal({ isOpen, onClose, product, onStockAdjusted }) {
  const { showToast } = useToast();

  const [mode, setMode] = useState('delta'); // 'delta' | 'set'
  const [delta, setDelta] = useState(5);
  const [newQuantity, setNewQuantity] = useState(product?.stock_quantity || 0);
  const [reason, setReason] = useState('Inventory Restock');
  const [submitting, setSubmitting] = useState(false);

  if (!product) return null;

  const currentStock = product.stock_quantity;
  const projectedStock =
    mode === 'delta'
      ? Math.max(0, currentStock + Number(delta))
      : Math.max(0, Number(newQuantity));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'delta') {
        await productsApi.adjustStock(product.id, {
          quantity_delta: Number(delta),
          reason,
        });
      } else {
        await productsApi.adjustStock(product.id, {
          new_quantity: Number(newQuantity),
          reason,
        });
      }

      showToast(`Stock for '${product.name}' updated to ${projectedStock} units!`, 'success');
      onStockAdjusted();
      onClose();
    } catch (err) {
      showToast('Failed to adjust stock: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product.name}`}
      subtitle={`SKU: ${product.sku} • Current Quantity: ${currentStock} units`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('delta')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'delta' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Add / Subtract Units
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('set');
              setNewQuantity(currentStock);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'set' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Set Exact Quantity
          </button>
        </div>

        {mode === 'delta' ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Quantity Adjustment (+ or -)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDelta((prev) => Number(prev) - 5)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => setDelta((prev) => Number(prev) - 1)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                -1
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="flex-1 text-center font-bold text-sm rounded-xl border border-slate-200 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setDelta((prev) => Number(prev) + 1)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setDelta((prev) => Number(prev) + 5)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                +5
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              New Absolute Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full text-center font-bold text-sm rounded-xl border border-slate-200 p-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Projected Stock Preview */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600">Projected Resulting Stock:</span>
          <span className="text-base font-bold text-indigo-600">{projectedStock} units</span>
        </div>

        {/* Reason selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Reason for Adjustment
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Inventory Restock">Supplier Restock Shipment</option>
            <option value="Physical Audit / Recount">Physical Audit / Recount</option>
            <option value="Damaged / Write-off">Damaged Goods Write-off</option>
            <option value="Demo Workstation Allocation">Demo Allocation</option>
            <option value="Manual Correction">Manual Correction</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                <Layers className="w-3.5 h-3.5" /> Confirm Adjustment
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
