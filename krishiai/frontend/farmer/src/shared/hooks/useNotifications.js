import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function useNotifications(pollIntervalMs = 30000) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      const list = res?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.warn('[useNotifications] Polling error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    const timer = setInterval(fetchNotifications, pollIntervalMs);
    return () => clearInterval(timer);
  }, [isAuthenticated, fetchNotifications, pollIntervalMs]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
  };
}
