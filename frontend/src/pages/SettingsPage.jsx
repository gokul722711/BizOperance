import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Building,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { settingsApi, coreApi } from '../api/endpoints';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function SettingsPage() {
  const { settings, refreshSettings, refreshNotifications } = useSettings();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    phone: '',
    address: '',
    currency_symbol: '$',
    currency_code: 'USD',
    tax_rate: 8.5,
    low_stock_threshold_default: 10,
    notifications_enabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || 'Apex Operations & Services',
        business_email: settings.business_email || 'contact@apexsolutions.demo',
        phone: settings.phone || '+1 (555) 345-6789',
        address: settings.address || '450 Enterprise Way, Suite 300, Metropolis',
        currency_symbol: settings.currency_symbol || '$',
        currency_code: settings.currency_code || 'USD',
        tax_rate: settings.tax_rate ?? 8.5,
        low_stock_threshold_default: settings.low_stock_threshold_default ?? 10,
        notifications_enabled: settings.notifications_enabled ?? true,
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update({
        ...formData,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        low_stock_threshold_default: parseInt(formData.low_stock_threshold_default) || 10,
      });
      await refreshSettings();
      showToast('Business profile and preferences saved!', 'success');
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    setResetting(true);
    try {
      await coreApi.resetDemo();
      await Promise.all([refreshSettings(), refreshNotifications()]);
      showToast('Demonstration data restored to baseline state!', 'success');
      setResetDialogOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      showToast('Error resetting demo: ' + err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Settings & Customization</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business profile branding, currency display, and system defaults
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" /> Business Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details appear across invoice headers, orders, and demonstration views
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Primary Operations Email *
              </label>
              <input
                type="email"
                required
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Headquarters Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Currency & Tax Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize localized currency symbols, standard rate multipliers, and inventory thresholds
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Currency Symbol
              </label>
              <select
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
                <option value="A$">A$ (AUD)</option>
                <option value="CHF">CHF (Swiss Franc)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                value={formData.currency_code}
                onChange={(e) => setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })}
                placeholder="USD"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Standard Demo Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Default Low-Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={formData.low_stock_threshold_default}
                onChange={(e) =>
                  setFormData({ ...formData, low_stock_threshold_default: e.target.value })
                }
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Products with units at or below this level trigger low-stock warning banners.
              </span>
            </div>

            <div className="sm:col-span-1 flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, notifications_enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Enable System Alerts
                </span>
              </label>
            </div>
          </div>

          {/* Live Currency Preview Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Active Currency Formatting Preview:</span>
            <span className="font-bold text-sm text-indigo-600">
              {formData.currency_symbol}1,250.00 {formData.currency_code}
            </span>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demonstration Management Card */}
      <div className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">Demonstration State Management</h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Reset all sample orders, customers, inventory stock levels, and activity back to the
                original clean seed baseline. Ideal after finishing a customer presentation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setResetDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetDemoData}
        title="Reset Demo Data to Initial Baseline?"
        message="This will repopulate standard demo customers, realistic orders, product stock counts, and activities. Any manual test modifications made during demonstration will be replaced with clean demo records."
        confirmText="Confirm Reset"
        isDanger={false}
        isLoading={resetting}
      />
    </div>
  );
}
