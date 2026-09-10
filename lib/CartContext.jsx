"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "bsmart_user_cart_v1";
const ORDERS_STORAGE_KEY = "bsmart_user_order_ids_v1";
const API_BASE_URL = "";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [userOrderIds, setUserOrderIds] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize cart & order history from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        // Default sample item if empty
        setCartItems([
          {
            id: "cart-item-default-1",
            productId: "prod-1",
            name: "Boys Full-Sleeve White Shirt (Bathinda)",
            school: "Delhi Public School",
            applicableClass: "I - V",
            category: "Boys Uniform",
            size: "30",
            price: 550,
            qty: 2,
            imageSrc: "/prod-shirt.jpg",
          },
          {
            id: "cart-item-default-2",
            productId: "prod-2",
            name: "Girls Pleated Dark Skirt",
            school: "St. Mary's",
            applicableClass: "VI - VIII",
            category: "Girls Uniform",
            size: "28",
            price: 600,
            qty: 1,
            imageSrc: "/prod-skirt.jpg",
          },
        ]);
      }

      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setUserOrderIds(JSON.parse(savedOrders));
      } else {
        // Track the demo order ID
        setUserOrderIds(["BS-1024", "BS-1023"]);
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

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

  // Sync user order IDs to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(userOrderIds));
      } catch (e) {
        console.warn("Could not save order IDs to localStorage", e);
      }
    }
  }, [userOrderIds, isLoaded]);

  // Real-time fetching and synchronization for user active orders
  const fetchActiveOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const relevant = data.orders.filter(
            (o) =>
              userOrderIds.includes(o.id) ||
              userOrderIds.includes(o.orderNumber) ||
              userOrderIds.includes(String(o.id)) ||
              userOrderIds.length === 0
          );
          setActiveOrders(relevant.length > 0 ? relevant : data.orders.slice(0, 3));
        }
      }
    } catch (err) {}
  }, [userOrderIds]);

  useEffect(() => {
    fetchActiveOrders();

    // 1. Supabase Realtime Postgres Changes Subscription
    let orderChannel;
    try {
      orderChannel = supabase
        .channel('user-cart-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setActiveOrders((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setActiveOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
          fetchActiveOrders();
        })
        .subscribe();
    } catch (e) {}

    // 2. EventSource (SSE) Live Broadcast Fallback
    let eventSource;
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        eventSource = new EventSource(`${API_BASE_URL}/api/realtime/stream`);
        eventSource.addEventListener('order_updated', (e) => {
          try {
            const updated = JSON.parse(e.data);
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          } catch (err) {}
        });
        eventSource.addEventListener('order_created', (e) => {
          try {
            const created = JSON.parse(e.data);
            setActiveOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);
          } catch (err) {}
        });
        eventSource.addEventListener('order_completed', (e) => {
          try {
            const completed = JSON.parse(e.data);
            setActiveOrders((prev) =>
              prev.map((o) => (o.id === completed.id ? { ...o, ...completed } : o))
            );
          } catch (err) {}
        });
      }
    } catch (e) {}

    // 3. Keep a backup poll every 3 seconds for snappy updates
    const interval = setInterval(fetchActiveOrders, 3000);

    return () => {
      if (orderChannel) supabase.removeChannel(orderChannel);
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [fetchActiveOrders]);

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

  // Calculated totals
  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  const deliveryFee = cartSubtotal >= 500 || cartItems.length === 0 ? 0 : 50;
  const cartTotal = cartSubtotal + deliveryFee;

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
