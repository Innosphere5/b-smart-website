"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

const NotificationContext = createContext(null);
const API_BASE_URL = "";

// Synthesize pleasant sound chime using Web Audio API
function playChime(type = 'default') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success' || type === 'order_accepted') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'order_declined') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // AudioContext autoplay restrictions
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?role=customer`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          // Filter out order_created messages which are admin-facing notifications
          const filtered = data.notifications.filter(
            (n) => n.type !== 'order_created' || n.targetRole === 'customer'
          );
          setNotifications(filtered);
        }
      }
    } catch (e) {}
  }, []);

  // Display a toast and trigger notification chime
  const showToast = useCallback((notif) => {
    setActiveToast(notif);
    playChime(notif.type);
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Handle incoming real-time notification
  const handleIncomingNotification = useCallback((notif) => {
    if (!notif || !notif.id) return;
    // Don't show admin-facing order_created notifications to customers
    if (notif.type === 'order_created' && notif.targetRole !== 'customer') return;

    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === notif.id);
      if (exists) return prev;
      return [notif, ...prev];
    });
    showToast(notif);
  }, [showToast]);

  // Connect to Supabase Realtime Channels & SSE Stream
  useEffect(() => {
    fetchNotifications();

    // 1. Supabase Realtime Postgres CDC
    let notifChannel;
    let orderChannel;
    try {
      notifChannel = supabase
        .channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          if (payload.new) {
            handleIncomingNotification({
              id: String(payload.new.id),
              orderId: payload.new.order_id,
              type: payload.new.type,
              title: payload.new.title,
              message: payload.new.message,
              targetRole: payload.new.target_role,
              read: Boolean(payload.new.read),
              createdAt: payload.new.created_at
            });
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsLiveConnected(true);
          }
        });

      orderChannel = supabase
        .channel('public:orders_events')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
          if (payload.new) {
            const userEmail = user?.email?.trim().toLowerCase();
            const orderEmail = (payload.new.customer_email || payload.new.customerEmail || '').toLowerCase();

            // Only show order update toast if the order belongs to the logged-in user
            if (!userEmail || !orderEmail || userEmail !== orderEmail) {
              return;
            }

            const status = payload.new.status;
            const orderNum = payload.new.order_number || payload.new.id;
            const deliveryTime = payload.new.delivery_time;

            if (status === 'accepted') {
              showToast({
                id: `toast-${Date.now()}`,
                orderId: payload.new.id,
                type: 'order_accepted',
                title: '🎉 Order Accepted & Scheduled!',
                message: `Order ${orderNum} accepted. Expected Delivery: ${deliveryTime || 'As scheduled'}`
              });
            } else if (status === 'declined') {
              showToast({
                id: `toast-${Date.now()}`,
                orderId: payload.new.id,
                type: 'order_declined',
                title: '⚠️ Order Status Update',
                message: `Order ${orderNum} was declined: ${payload.new.declinereason || payload.new.decline_reason || 'Items out of stock'}`
              });
            } else if (status === 'completed' || payload.new.user_completed) {
              showToast({
                id: `toast-${Date.now()}`,
                orderId: payload.new.id,
                type: 'order_completed',
                title: '✅ Order Fulfilled & Completed!',
                message: `Order ${orderNum} marked as completed ✓`
              });
            }
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscription notice:', e);
    }

    // 2. EventSource (SSE) stream fallback for Express broadcast
    let eventSource;
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        eventSource = new EventSource(`${API_BASE_URL}/api/realtime/stream`);
        eventSource.addEventListener('notification', (e) => {
          try {
            const data = JSON.parse(e.data);
            handleIncomingNotification(data);
          } catch (err) {}
        });

        eventSource.addEventListener('order_updated', (e) => {
          try {
            const data = JSON.parse(e.data);
            const userEmail = user?.email?.trim().toLowerCase();
            const orderEmail = (data.customerEmail || data.customer_email || '').toLowerCase();

            // Only show order update toast if the order belongs to the logged-in user
            if (!userEmail || !orderEmail || userEmail !== orderEmail) {
              return;
            }

            if (data.status === 'accepted') {
              showToast({
                id: `toast-sse-${Date.now()}`,
                orderId: data.id,
                type: 'order_accepted',
                title: '🎉 Order Accepted & Scheduled!',
                message: `Order ${data.orderNumber || data.id} accepted. Expected Delivery: ${data.deliveryTime || 'As scheduled'}`
              });
            }
          } catch (err) {}
        });

        eventSource.onopen = () => setIsLiveConnected(true);
      }
    } catch (e) {}

    // 3. Fallback polling every 5 seconds for live sync
    const pollInterval = setInterval(fetchNotifications, 5000);

    return () => {
      if (notifChannel) supabase.removeChannel(notifChannel);
      if (orderChannel) supabase.removeChannel(orderChannel);
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [fetchNotifications, handleIncomingNotification, showToast]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'POST' });
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, { method: 'POST' });
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        isLiveConnected,
        showToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
