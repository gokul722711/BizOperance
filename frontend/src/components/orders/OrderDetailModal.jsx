import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Clock, Ban, DollarSign, Calendar, User, Mail, Phone } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import ConfirmDialog from '../common/ConfirmDialog';
import { ordersApi } from '../../api/endpoints';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';

export default function OrderDetailModal({ isOpen, onClose, orderId, onOrderUpdated }) {
  const { formatCurrency } = useSettings();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrder();
    }
  }, [isOpen, orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.get(orderId);
      setOrder(res.data);
    } catch (err) {
      showToast('Failed to load order details: ' + err.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(orderId, newStatus);
      setOrder(res.data);
      showToast(`Order status updated to ${newStatus}`, 'success');
      onOrderUpdated && onOrderUpdated();
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async (newPayment) => {
    setUpdating(true);
    try {
      const res = await ordersApi.updatePaymentStatus(orderId, newPayment);
      setOrder(res.data);
      showToast(`Payment status updated to ${newPayment}`, 'success');
      onOrderUpdated && onOrderUpdated();
    } catch (err) {
      showToast('Failed to update payment: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    setUpdating(true);
    try {
      const res = await ordersApi.cancel(orderId);
      setOrder(res.data);
      showToast('Order cancelled and inventory restored', 'info');
      setCancelDialogOpen(false);
      onOrderUpdated && onOrderUpdated();
    } catch (err) {
      showToast('Failed to cancel order: ' + err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={order ? `Order Details: ${order.order_number}` : 'Order Information'}
        subtitle="Full operational record, line items, and transaction actions"
        maxWidth="max-w-2xl"
      >
        {loading || !order ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs text-slate-500">Fetching order data...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Order Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={order.status} type="order" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Payment Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={order.payment_status} type="payment" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Order Date
                </span>
                <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {order.order_date ? new Date(order.order_date).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Customer Card */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {order.customer_name}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {order.customer_email || 'No email'}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.customer_phone || 'No phone'}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Order Line Items
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Product / Service</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-64 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({order.tax_rate}%):</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(order.tax_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Notes:</span> {order.notes}
              </div>
            )}

            {/* Status Change Operations */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quick Actions
              </h4>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 mr-1">Status:</span>
                  {order.status !== 'processing' && order.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus('processing')}
                      disabled={updating}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Process
                    </button>
                  )}
                  {order.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={updating}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                    </button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={updating}
                      className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 mr-1">Payment:</span>
                  {order.payment_status !== 'paid' && (
                    <button
                      onClick={() => handleUpdatePayment('paid')}
                      disabled={updating}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Mark Paid
                    </button>
                  )}
                  {order.payment_status === 'pending' && (
                    <button
                      onClick={() => handleUpdatePayment('partially_paid')}
                      disabled={updating}
                      className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Mark Partial
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Confirm */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title={`Cancel Order ${order?.order_number}?`}
        message="Cancelling this order will restore the reserved quantities back into inventory stock."
        confirmText="Confirm Cancellation"
        isDanger={true}
        isLoading={updating}
      />
    </>
  );
}
