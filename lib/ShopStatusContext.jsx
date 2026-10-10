"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ShopStatusContext = createContext(null);

export function ShopStatusProvider({ children, initialStatus = null }) {
  const [shopStatus, setShopStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(!initialStatus);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  // Fetch current shop status
  const fetchStatus = useCallback(async (isFresh = false) => {
    try {
      const res = await fetch(`/api/shop-status${isFresh ? '?fresh=1' : ''}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.shopStatus) {
          setShopStatus(data.shopStatus);
          return data.shopStatus;
        }
      }
    } catch (err) {
      console.warn('Error fetching shop status:', err);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Check session storage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ackKey = `bsmart_closure_ack_${shopStatus?.updatedAt || shopStatus?.reopenDate || 'default'}`;
      const ack = sessionStorage.getItem(ackKey);
      if (ack === 'true') {
        setHasAcknowledged(true);
      }
    }
  }, [shopStatus?.updatedAt, shopStatus?.reopenDate]);

  // Initial load & Supabase Realtime CDC subscription
  useEffect(() => {
    // If no initialStatus was passed, fetch immediately
    if (!initialStatus) {
      fetchStatus();
    }

    // 1. Supabase Realtime Postgres Changes
    let channel;
    try {
      channel = supabase
        .channel('public:sys_shop_status')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: 'id=eq.sys_shop_status' },
          (payload) => {
            if (payload?.new?.message) {
              try {
                const parsed = JSON.parse(payload.new.message);
                setShopStatus(parsed);

                // If admin turned on closure live, show popup to visitor
                if (parsed.isClosed && parsed.showPopup !== false) {
                  setIsPopupOpen(true);
                }
              } catch (e) {}
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription notice for shop status:', e);
    }

    // 2. Fallback polling every 8 seconds for live sync
    const pollInterval = setInterval(() => {
      fetchStatus();
    }, 8000);

    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchStatus, initialStatus]);

  // Auto-open popup on arrival if shop is closed and visitor has not acknowledged in this session
  useEffect(() => {
    if (shopStatus && shopStatus.isClosed && shopStatus.showPopup !== false && !hasAcknowledged) {
      const timer = setTimeout(() => {
        setIsPopupOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [shopStatus, hasAcknowledged]);

  const openPopup = useCallback(() => {
    setIsPopupOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const acknowledgePopup = useCallback(() => {
    setIsPopupOpen(false);
    setHasAcknowledged(true);
    if (typeof window !== 'undefined') {
      const ackKey = `bsmart_closure_ack_${shopStatus?.updatedAt || shopStatus?.reopenDate || 'default'}`;
      sessionStorage.setItem(ackKey, 'true');
    }
  }, [shopStatus?.updatedAt, shopStatus?.reopenDate]);

  const isClosed = Boolean(shopStatus?.isClosed);
  const allowOrders = shopStatus?.allowOrders !== false;
  const deliveryOrdersClosed = Boolean(shopStatus?.deliveryOrdersClosed);

  // Delivery orders are considered closed if deliveryOrdersClosed is explicitly true,
  // or if store is closed (isClosed === true), or if allowOrders is false.
  const isDeliveryClosed = Boolean(
    deliveryOrdersClosed || isClosed || !allowOrders
  );

  const closureDays = Number(shopStatus?.closureDays) || 2;
  const reopenDate = shopStatus?.reopenDate;
  const reopenDateFormatted = shopStatus?.reopenDateFormatted || 'Saturday, 10 Oct 2026';
  const bannerTitle = shopStatus?.bannerTitle || `Shop Temporarily Closed for ${closureDays} Days`;
  const bannerMessage =
    shopStatus?.bannerMessage ||
    `We are currently not processing any online orders, Please revisit our website after a few business days.`;
  const showTopBanner = isClosed && shopStatus?.showTopBanner !== false;

  return (
    <ShopStatusContext.Provider
      value={{
        shopStatus,
        isLoading,
        isClosed,
        isDeliveryClosed,
        deliveryOrdersClosed,
        closureDays,
        reopenDate,
        reopenDateFormatted,
        bannerTitle,
        bannerMessage,
        allowOrders,
        showTopBanner,
        isPopupOpen,
        openPopup,
        closePopup,
        acknowledgePopup,
        refreshStatus: () => fetchStatus(true),
      }}
    >
      {children}
    </ShopStatusContext.Provider>
  );
}

export function useShopStatus() {
  const context = useContext(ShopStatusContext);
  if (!context) {
    throw new Error('useShopStatus must be used within a ShopStatusProvider');
  }
  return context;
}
