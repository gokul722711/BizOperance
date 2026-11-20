import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  RotateCcw,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { coreApi } from '../../api/endpoints';
import ConfirmDialog from '../common/ConfirmDialog';

const ROUTE_TITLES = {
  '/': 'Dashboard Overview',
  '/orders': 'Orders & Transactions',
  '/products': 'Products & Inventory',
  '/customers': 'Customer Management',
  '/tasks': 'Tasks & Workflow',
  '/reports': 'Reports & Analytics',
  '/settings': 'Business Settings',
};

export default function Header({ onOpenSearch, onOpenMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshSettings, refreshNotifications } = useSettings();
  const { showToast } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const notifRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'BizOperance';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await coreApi.resetDemo();
      await Promise.all([refreshSettings(), refreshNotifications()]);
      showToast('Demo data successfully restored to original baseline state.', 'success');
      setResetDialogOpen(false);
      // Reload page data
      navigate(0);
    } catch (err) {
      showToast('Failed to reset demo data: ' + err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile Menu Trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {pageTitle}
            </h2>
          </div>
        </div>

        {/* Right: Search bar, Date, Notification bell, Demo reset, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/60"
            title="Global search (Ctrl+K / Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search records...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 text-slate-400 rounded-md font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Date pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-500 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Quick Demo Reset Button */}
          <button
            onClick={() => setResetDialogOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 transition-colors"
            title="Reset demonstration data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => {
                      let Icon = Info;
                      let iconColor = 'text-blue-500 bg-blue-50';
                      if (n.notification_type === 'warning') {
                        Icon = AlertTriangle;
                        iconColor = 'text-amber-500 bg-amber-50';
                      } else if (n.notification_type === 'danger') {
                        Icon = AlertTriangle;
                        iconColor = 'text-rose-500 bg-rose-50';
                      } else if (n.notification_type === 'success') {
                        Icon = CheckCircle2;
                        iconColor = 'text-emerald-500 bg-emerald-50';
                      }

                      return (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                            !n.is_read ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl flex-shrink-0 ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User / Business initials badge */}
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
            title="Business profile"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              <Building className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Demo Reset Safety Confirmation */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetDemo}
        title="Reset Demonstration Data?"
        message="This will restore all products, orders, customers, tasks, and system activities back to the initial pristine baseline state. Use this between prospective client presentations."
        confirmText="Confirm Reset"
        isDanger={false}
        isLoading={resetting}
      />
    </>
  );
}
