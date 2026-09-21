"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "bsmart_user_cart_v1";
const API_BASE_URL = "";

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [userOrderIds, setUserOrderIds] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic user-scoped order IDs storage key
  const userOrderStorageKey = user?.uid
    ? `bsmart_orders_${user.uid}`
    : "bsmart_guest_order_ids";

  // Initialize cart from localStorage & clean up any legacy dummy demo order IDs
  useEffect(() => {
    try {
      // Clear legacy poisoned storage if present
      const legacyOrders = localStorage.getItem("bsmart_user_order_ids_v1");
      if (legacyOrders) {
        try {
          const parsed = JSON.parse(legacyOrders);
          const cleaned = parsed.filter((id) => id !== "BS-1024" && id !== "BS-1023");
          if (cleaned.length === 0) {
            localStorage.removeItem("bsmart_user_order_ids_v1");
          }
        } catch (e) {}
      }

      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Load user-scoped order IDs when user changes or loads
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(userOrderStorageKey);
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        const filtered = Array.isArray(parsed)
          ? parsed.filter((id) => id !== "BS-1024" && id !== "BS-1023")
          : [];
        setUserOrderIds(filtered);
      } else {
        setUserOrderIds([]);
      }
    } catch (e) {
      setUserOrderIds([]);
    }
  }, [userOrderStorageKey]);

  // Sync cart changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.warn("Could not save cart to localStorage", e);
      }
    }
  }, [cartItems, isLoaded]);

  // Sync user order IDs to user-scoped localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(userOrderStorageKey, JSON.stringify(userOrderIds));
      } catch (e) {
        console.warn("Could not save order IDs to localStorage", e);
      }
    }
  }, [userOrderIds, userOrderStorageKey, isLoaded]);

  // Real-time fetching and synchronization strictly for current user orders
  const fetchActiveOrders = useCallback(async () => {
    const userEmail = user?.email?.trim().toLowerCase();

    // If user is not logged in and has no placed order IDs on this device, show nothing
    if (!userEmail && userOrderIds.length === 0) {
      setActiveOrders([]);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (userEmail) params.set("email", userEmail);
      if (userOrderIds.length > 0) params.set("orderIds", userOrderIds.join(","));

      const res = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Strictly verify every order belongs to the user
          const relevant = data.orders.filter((o) => {
            const oEmail = (o.customerEmail || "").toLowerCase();
            const matchesEmail = userEmail && oEmail && oEmail === userEmail;
            const matchesId =
              userOrderIds.includes(String(o.id)) ||
              userOrderIds.includes(String(o.orderNumber)) ||
              userOrderIds.includes(String(o.rawOrderNumber || ""));
            return matchesEmail || matchesId;
          });
          setActiveOrders(relevant);
        }
      }
    } catch (err) {
      // Quiet fail on network interruption
    }
  }, [user?.email, userOrderIds]);

  useEffect(() => {
    fetchActiveOrders();

    // 1. Supabase Realtime Postgres Changes Subscription
    let orderChannel;
    try {
      const channelId = `user-orders-${user?.uid || "guest"}-${Date.now()}`;
      orderChannel = supabase
        .channel(channelId)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          const userEmail = user?.email?.trim().toLowerCase();

          if (payload.eventType === "INSERT" && payload.new) {
            const newOrder = payload.new;
            const oEmail = (newOrder.customer_email || "").toLowerCase();
            const isOwn =
              (userEmail && oEmail && oEmail === userEmail) ||
              userOrderIds.includes(String(newOrder.id)) ||
              userOrderIds.includes(String(newOrder.order_number));

            if (isOwn) {
              setActiveOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
            }
          } else if (payload.eventType === "UPDATE" && payload.new) {
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            setActiveOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
          fetchActiveOrders();
        })
        .subscribe();
    } catch (e) {}

    // 2. EventSource (SSE) Live Broadcast Fallback
    let eventSource;
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        eventSource = new EventSource(`${API_BASE_URL}/api/realtime/stream`);
        eventSource.addEventListener("order_updated", (e) => {
          try {
            const updated = JSON.parse(e.data);
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          } catch (err) {}
        });
        eventSource.addEventListener("order_created", (e) => {
          try {
            const created = JSON.parse(e.data);
            const userEmail = user?.email?.trim().toLowerCase();
            const oEmail = (created.customerEmail || "").toLowerCase();
            const isOwn =
              (userEmail && oEmail && oEmail === userEmail) ||
              userOrderIds.includes(String(created.id)) ||
              userOrderIds.includes(String(created.orderNumber));
            if (isOwn) {
              setActiveOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);
            }
          } catch (err) {}
        });
        eventSource.addEventListener("order_completed", (e) => {
          try {
            const completed = JSON.parse(e.data);
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === completed.id ? { ...o, ...completed } : o))
            );
          } catch (err) {}
        });
      }
    } catch (e) {}

    // 3. Keep a backup poll every 5 seconds for active order updates
    const interval = setInterval(fetchActiveOrders, 5000);

    return () => {
      if (orderChannel) supabase.removeChannel(orderChannel);
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [fetchActiveOrders, user?.email, userOrderIds]);

  // Add Item to Cart
  const addToCart = (product, selectedSize, qty = 1) => {
    if (!product) return;

    const size = String(selectedSize || product.sizes?.[0] || "30");
    const price = Number(product.sizePrices?.[size] ?? product.basePrice ?? 500);
    const cartItemId = `${product.id}-${size}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + qty,
        };
        return updated;
      } else {
        const newItem = {
          id: cartItemId,
          productId: String(product.id),
          name: product.name,
          school: product.school || "General School",
          applicableClass: product.applicableClass || "",
          category: product.category || "School Uniform",
          size: size,
          price: price,
          qty: qty,
          imageSrc: product.imageSrc || product.images?.[0] || "/prod-shirt.jpg",
        };
        return [...prev, newItem];
      }
    });
  };

  // Remove Item from Cart
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update Item Quantity
  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Record placed order ID to track status
  const recordPlacedOrder = (order) => {
    if (!order) return;
    const orderId = order.id || order.orderNumber;
    setUserOrderIds((prev) => [orderId, ...prev.filter((id) => id !== orderId)]);
    setActiveOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
  };

  // Complete Order Tick (User Confirms Received)
  const completeOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/complete`, {
        method: "PUT",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setActiveOrders((prev) =>
            prev.map((o) => (o.id === orderId ? data.order : o))
          );
          return data.order;
        }
      }
    } catch (err) {
      console.error("Error completing order:", err);
    }
    // Optimistic fallback update
    setActiveOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, status: "completed", userCompleted: true }
          : o
      )
    );
    return null;
  };

  // Calculated totals: Universal Free Delivery & ₹500 Minimum Order
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  // Universal Free Delivery is 0 across the entire system
  const deliveryFee = 0;
  const cartTotal = cartSubtotal;
  const minOrderAmount = 500;
  const isMinOrderMet = cartSubtotal >= 500;
  const amountNeededForMinOrder = Math.max(0, 500 - cartSubtotal);

  // Find latest active order that was accepted and needs user attention or was recently placed
  const latestAcceptedOrder = activeOrders.find(
    (o) => o.status === "accepted" && !o.userCompleted
  );

  const latestActiveOrder = activeOrders.find(
    (o) => o.status === "accepted" || o.status === "pending"
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        minOrderAmount,
        isMinOrderMet,
        amountNeededForMinOrder,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        activeOrders,
        recordPlacedOrder,
        completeOrder,
        latestAcceptedOrder,
        latestActiveOrder,
        fetchActiveOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
