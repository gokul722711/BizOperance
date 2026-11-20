import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, MapPin, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { customersApi } from '../../api/endpoints';
import { useSettings } from '../../context/SettingsContext';

export default function CustomerDetailModal({ isOpen, onClose, customerId }) {
  const { formatCurrency } = useSettings();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomer();
    }
  }, [isOpen, customerId]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const res = await customersApi.get(customerId);
      setCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? customer.name : 'Customer Profile'}
      subtitle="Client details, spending history, and recent orders"
      maxWidth="max-w-xl"
    >
      {loading || !customer ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-500">Loading client file...</span>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Account Type</span>
              <div className="mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
                  {customer.customer_type}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {customer.total_orders || 0} orders
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                {formatCurrency(customer.total_spent || 0)}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{customer.phone || 'No phone number on record'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{customer.address || 'No address provided'}</span>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-amber-900">Notes:</span> {customer.notes}
            </div>
          )}

          {/* Recent Orders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Recent Order History
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Order</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.recent_orders?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                        No orders placed by this customer yet.
                      </td>
                    </tr>
                  ) : (
                    customer.recent_orders?.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold text-slate-800">{ord.order_number}</td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {new Date(ord.order_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={ord.status} type="order" />
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                          {formatCurrency(ord.total_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
