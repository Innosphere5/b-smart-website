"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GarmentThumb from "@/components/GarmentThumb";
import Badge from "@/components/Badge";
import {
  Trash2,
  Minus,
  Plus,
  Lock,
  ArrowRight,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  Truck,
  Check
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";

export default function CartPage() {
  const { user } = useAuth();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    removeFromCart,
    updateQty,
    clearCart,
    activeOrders,
    completeOrder,
    latestAcceptedOrder,
    latestActiveOrder
  } = useCart();

  const isOrderOwner = (o) => {
    if (!user || !o) return false;
    const userEmail = user?.email?.trim().toLowerCase();
    const orderEmail = (o.customerEmail || "").trim().toLowerCase();
    return userEmail && orderEmail && userEmail === orderEmail;
  };

  const [completingOrderId, setCompletingOrderId] = useState(null);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const handleCompleteTick = async (orderId) => {
    setCompletingOrderId(orderId);
    try {
      await completeOrder(orderId);
      setCompletedSuccess(true);
      setTimeout(() => setCompletedSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setCompletingOrderId(null);
    }
  };

  const API_BASE_URL = "";

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
      <Header activeHref="/cart" />

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {/* ======================================================== */}
        {/* 1. REAL-TIME ADMIN NOTIFICATION & ORDER STATUS BANNER    */}
        {/* ======================================================== */}
        {user && latestAcceptedOrder && isOrderOwner(latestAcceptedOrder) && !completedSuccess && (
          <div className="mb-5 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-2.5 sm:gap-3.5">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-600 text-white shadow-md">
                  <Truck size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="rounded-full bg-emerald-600 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                      Order Confirmed
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-800">
                      {latestAcceptedOrder.orderNumber || latestAcceptedOrder.id}
                    </span>
                  </div>
                  <h2 className="mt-1 text-sm sm:text-base md:text-lg font-black text-emerald-950">
                    Delivery at:{" "}
                    <span className="text-[#881337] underline decoration-[#FACC15] decoration-2">
                      {latestAcceptedOrder.deliveryTime || "Today by 5:30 PM"}
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 mt-0.5">
                    {latestAcceptedOrder.customerName} • {latestAcceptedOrder.school} • ₹{latestAcceptedOrder.totalAmount}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <a
                  href={`${API_BASE_URL}/api/orders/${latestAcceptedOrder.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-emerald-300 bg-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                >
                  <FileText size={13} className="text-[#881337]" /> PDF Order Form
                </a>

                <button
                  onClick={() => handleCompleteTick(latestAcceptedOrder.id)}
                  disabled={completingOrderId === latestAcceptedOrder.id}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#047857] px-3 sm:px-4 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-black text-white shadow-md transition hover:bg-[#065F46] hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {completingOrderId === latestAcceptedOrder.id ? (
                    <span>Notifying...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-[#FACC15]" />
                      <span>Mark Received ✓</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completed Feedback Banner */}
        {completedSuccess && (
          <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl sm:rounded-2xl border-2 border-emerald-500 bg-emerald-600 p-3 sm:p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle2 size={20} className="text-[#FACC15] shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-black">Order Marked as Completed!</p>
                <p className="text-[10px] sm:text-xs text-emerald-100 font-semibold">
                  Admin has been notified. Thank you!
                </p>
              </div>
            </div>
            <Link
              href="/orders"
              className="rounded-lg bg-white px-3 py-1.5 text-[10px] sm:text-xs font-black text-emerald-900 shadow-sm hover:bg-emerald-50 shrink-0"
            >
              Order History
            </Link>
          </div>
        )}

        {/* Pending Order Notice */}
        {user && !latestAcceptedOrder && latestActiveOrder && isOrderOwner(latestActiveOrder) && latestActiveOrder.status === "pending" && (
          <div className="mb-5 sm:mb-8 rounded-xl sm:rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock size={18} className="text-amber-700 animate-spin shrink-0" />
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-amber-900 uppercase">
                    Order {latestActiveOrder.orderNumber || latestActiveOrder.id} Awaiting Confirmation
                  </p>
                  <p className="text-[10px] sm:text-xs text-amber-800 font-semibold">
                    Admin is verifying stock and will notify delivery time shortly.
                  </p>
                </div>
              </div>
              <a
                href={`${API_BASE_URL}/api/orders/${latestActiveOrder.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-[10px] sm:text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 shrink-0"
              >
                <FileText size={12} /> Order Form
              </a>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MAIN CART ITEMS & SUMMARY LAYOUT                      */}
        {/* ======================================================== */}
        <div className="grid gap-5 sm:gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#7F1D1D]">Shopping Cart</h1>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-600">
                  {cartCount} item{cartCount === 1 ? "" : "s"} in your uniform cart
                </p>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[10px] sm:text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="mt-5 sm:mt-6 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#FCD34D] bg-white p-8 sm:p-12 text-center shadow-md">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFFDF0] text-[#9F1239] border-2 border-[#FCD34D]">
                  <ShoppingCart size={28} />
                </div>
                <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-black text-[#7F1D1D]">Your Cart is Empty</h2>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-gray-600 max-w-sm">
                  Browse our school catalog to select your uniforms, choose sizes, and place your order.
                </p>
                <Link
                  href="/"
                  className="mt-5 sm:mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-[#7F1D1D] shadow-md hover:bg-[#EAB308]"
                >
                  Shop Uniforms <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border-2 border-[#FCD34D] bg-white p-3 sm:p-4 shadow-sm transition hover:border-[#9F1239] hover:shadow-md"
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-[#FFFDF0] border border-[#FDE047] p-1 flex items-center justify-center">
                      <img
                        src={item.imageSrc || "/prod-shirt.jpg"}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-black text-[#450A0A]">{item.name}</p>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-600">{item.school}</p>
                        </div>
                        <button
                          aria-label="Remove item"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Badges: Size & School */}
                      <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="rounded-md sm:rounded-lg bg-[#881337] px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-black text-white shadow-xs">
                          Size {item.size}
                        </span>
                        {item.category && (
                          <span className="rounded-md sm:rounded-lg bg-[#FEFCE8] border border-[#FCD34D] px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#9F1239]">
                            {item.category}
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-md">
                          ₹{item.price}/unit
                        </span>
                      </div>

                      {/* Quantity and Line Total */}
                      <div className="mt-3 sm:mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-3 rounded-lg border-2 border-[#FCD34D] bg-[#FFFDF0] px-2 sm:px-2.5 py-1">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.id, -1)}
                            className="text-[#9F1239] hover:text-[#7F1D1D] font-bold p-0.5"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-4 sm:w-5 text-center text-xs sm:text-sm font-black text-[#450A0A]">
                            {item.qty}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, 1)}
                            className="text-[#9F1239] hover:text-[#7F1D1D] font-bold p-0.5"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <p className="text-sm sm:text-base font-black text-[#9F1239]">
                          ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. ORDER SUMMARY CARD                                    */}
          {/* ======================================================== */}
          <aside className="h-fit rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 shadow-md">
            <h2 className="text-base sm:text-lg font-black text-[#7F1D1D]">Order Summary</h2>

            <dl className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-semibold text-gray-700">
              <div className="flex justify-between">
                <dt>Items ({cartCount})</dt>
                <dd className="font-black text-[#450A0A]">₹{cartSubtotal.toFixed(2)}</dd>
              </div>

              <div className="flex justify-between items-center">
                <dt>Home Delivery</dt>
                <dd className="font-black text-[#047857]">
                  FREE (Universal)
                </dd>
              </div>

              {cartSubtotal < 500 && cartItems.length > 0 && (
                <div className="text-[11px] font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-300">
                  ⚠️ <strong>Minimum order amount is ₹500.</strong> Add ₹{(500 - cartSubtotal).toFixed(2)} more to place your order. Delivery is always <strong>FREE</strong>!
                </div>
              )}
            </dl>

            <div className="mt-4 sm:mt-5 flex justify-between border-t-2 border-[#FCD34D] pt-3 sm:pt-4">
              <span className="text-base sm:text-lg font-black text-[#7F1D1D]">Total</span>
              <span className="text-lg sm:text-xl font-black text-[#9F1239]">₹{cartTotal.toFixed(2)}</span>
            </div>

            {cartItems.length > 0 ? (
              cartSubtotal >= 500 ? (
                <Link
                  href="/checkout"
                  className="btn-accent mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 py-3 sm:py-4 text-sm sm:text-base font-black shadow-lg hover:shadow-xl transition"
                >
                  Proceed to Checkout (Free Delivery) <ArrowRight size={16} />
                </Link>
              ) : (
                <div className="mt-4 sm:mt-6">
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-100 border border-amber-300 py-3 sm:py-4 text-xs sm:text-sm font-black text-amber-800 cursor-not-allowed shadow-inner"
                  >
                    Add ₹{(500 - cartSubtotal).toFixed(2)} more to Checkout (Min ₹500)
                  </button>
                  <Link
                    href="/"
                    className="mt-2 text-center block text-xs font-black text-[#9F1239] underline hover:text-[#7F1D1D]"
                  >
                    + Add more uniform items to cart
                  </Link>
                </div>
              )
            ) : (
              <button
                disabled
                className="mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-200 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-gray-400 cursor-not-allowed"
              >
                Your Cart is Empty
              </button>
            )}

            <p className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-500">
              <Lock size={12} className="text-emerald-600" /> 100% Genuine Quality
            </p>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
