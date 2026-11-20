import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi, coreApi } from '../api/endpoints';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    business_name: 'Apex Operations & Services',
    business_email: 'operations@apexsolutions.demo',
    phone: '+1 (555) 345-6789',
    address: '450 Enterprise Way, Suite 300, Metropolis',
    currency_symbol: '$',
    currency_code: 'USD',
    tax_rate: 8.5,
    low_stock_threshold_default: 10,
    notifications_enabled: true,
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await settingsApi.get();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await coreApi.notifications();
      const items = res.data?.results || res.data || [];
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([refreshSettings(), refreshNotifications()]);
      setLoading(false);
    };
    init();
  }, [refreshSettings, refreshNotifications]);

  const markNotificationRead = async (id) => {
    try {
      await coreApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await coreApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatCurrency = useCallback(
    (amount) => {
      const num = Number(amount) || 0;
      const symbol = settings?.currency_symbol || '$';
      return `${symbol}${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [settings?.currency_symbol]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        formatCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
