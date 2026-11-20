import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { ordersApi, productsApi, customersApi } from '../../api/endpoints';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
  const { settings, formatCurrency } = useSettings();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { product_id: '', product_name: '', unit_price: 0, quantity: 1 },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.list({ page_size: 100 }),
        productsApi.list({ is_available: true, page_size: 100 }),
      ]);
      const custList = custRes.data?.results || custRes.data || [];
      const prodList = prodRes.data?.results || prodRes.data || [];
      setCustomers(custList);
      setProducts(prodList);

      if (custList.length > 0 && !customerId) {
        setCustomerId(custList[0].id);
      }
    } catch (err) {
      showToast('Failed to load customers or products catalog', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleProductSelect = (index, prodId) => {
    const selected = products.find((p) => p.id === Number(prodId));
    if (!selected) return;

    const newItems = [...items];
    newItems[index] = {
      product_id: selected.id,
      product_name: selected.name,
      unit_price: Number(selected.unit_price),
      quantity: newItems[index].quantity || 1,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, parseInt(qty) || 1);
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: '', product_name: '', unit_price: 0, quantity: 1 }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  const taxRate = Number(settings?.tax_rate) || 8.5;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Please select a customer', 'error');
      return;
    }

    const validItems = items.filter((it) => it.product_id && it.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid product or service', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await ordersApi.create({
        customer_id: Number(customerId),
        status,
        payment_status: paymentStatus,
        notes,
        items: validItems.map((it) => ({
          product_id: Number(it.product_id),
          product_name: it.product_name,
          unit_price: it.unit_price,
          quantity: it.quantity,
        })),
      });

      showToast('Order created successfully!', 'success');
      onOrderCreated();
      onClose();
    } catch (err) {
      showToast('Failed to create order: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      subtitle="Assemble an order with items, customer and tax calculations"
      maxWidth="max-w-2xl"
    >
      {loadingData ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-500">Loading catalog items...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Select Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customer_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Payment
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Order Items ({items.length})
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      required
                      className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select Product / Service...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(p.unit_price)} ({p.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      className="w-full text-xs text-center rounded-lg border border-slate-200 px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      title="Quantity"
                    />
                  </div>

                  <div className="w-24 text-right text-xs font-semibold text-slate-800">
                    {formatCurrency((item.unit_price || 0) * (item.quantity || 1))}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Demo Tax ({taxRate}%):</span>
              <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Order Total:</span>
              <span className="text-indigo-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Client requested delivery by Friday; Net-30 invoice terms."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" /> Create Order
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
