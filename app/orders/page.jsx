"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  LogOut,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useNotifications } from "@/lib/NotificationContext";
import { useAuth } from "@/lib/AuthContext";

const API_BASE_URL = "";

const SIDEBAR_LINKS = [
  { label: "My Orders", Icon: Package, active: true },
  { label: "Personal Information", Icon: User },
  { label: "Saved Addresses", Icon: MapPin },
  { label: "Payment Methods", Icon: CreditCard },
];

export default function OrdersPage() {
  const { activeOrders, completeOrder } = useCart();
  const { isLiveConnected } = useNotifications();
  const { user, logout } = useAuth();
  const [completingId, setCompletingId] = useState(null);

  const handleComplete = async (orderId) => {
    setCompletingId(orderId);
    try {
      await completeOrder(orderId);
    } catch (e) {
      console.error(e);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <main className="app-frame bg-[#FEF8E7]">
      <Header activeHref="/orders" />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 md:grid-cols-4 md:px-10 md:py-10">
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border-2 border-[#FCD34D] bg-white p-4 shadow-md md:col-span-1">
          <div className="px-3 py-2">
            <p className="text-sm font-black text-[#7F1D1D]">My Account</p>
            {user?.displayName && (
              <p className="text-[11px] font-bold text-gray-500 truncate mt-0.5">
                {user.displayName}
              </p>
            )}
          </div>
          <nav className="mt-1 flex flex-col gap-1">
            <Link
              href="/orders"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-black bg-[#881337] text-white shadow-sm"
            >
              <Package size={16} /> My Orders
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-black text-gray-700 hover:bg-[#FEFCE8] transition-colors"
            >
              <User size={16} /> Profile & Settings
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-black text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer mt-2 pt-2 border-t border-gray-100"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Orders List */}
        <section className="md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-[#7F1D1D]">My Orders</h1>
                {isLiveConnected && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 text-xs font-black text-emerald-800 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Realtime Sync
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-600 mt-1">
                Track your order fulfilment, delivery times and download official pdf order form.
              </p>
            </div>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-black text-[#9F1239] hover:underline"
            >
              <ShoppingBag size={14} /> Shop More
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#FCD34D] bg-white p-12 text-center shadow-sm">
                <Package size={40} className="text-gray-400" />
                <h3 className="mt-4 text-base font-black text-[#7F1D1D]">No Orders Placed Yet</h3>
                <p className="mt-1 text-xs text-gray-500 font-semibold max-w-xs">
                  Your uniform orders and live delivery tracking will appear here once you checkout.
                </p>
                <Link
                  href="/"
                  className="btn-accent mt-5 px-5 py-2.5 text-xs font-black"
                >
                  Browse Uniforms Catalog
                </Link>
              </div>
            ) : (
              activeOrders.map((order) => {
                const isAccepted = order.status === "accepted";
                const isCompleted = order.status === "completed" || order.userCompleted;
                const isDeclined = order.status === "declined";
                const orderNum = order.orderNumber || order.id;

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border-2 border-[#FCD34D] bg-white p-5 shadow-sm transition hover:border-[#9F1239] hover:shadow-md"
                  >
                    {/* Header: Order ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-[#881337]">
                            {orderNum}
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            • {order.school || "General School"}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400">
                          {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase shadow-xs ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isAccepted
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : isDeclined
                              ? "bg-red-100 text-red-900 border border-red-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                        <span className="text-base font-black text-[#7F1D1D]">
                          ₹{order.totalAmount || order.price || 0}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Notification Banner if Accepted */}
                    {isAccepted && (
                      <div className="mt-3.5 rounded-xl bg-blue-50 border border-blue-200 p-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Truck size={18} className="text-blue-700 shrink-0" />
                          <p className="text-xs font-black text-blue-950">
                            Delivery Scheduled:{" "}
                            <span className="text-[#881337] underline decoration-[#FACC15]">
                              {order.deliveryTime || "Today by 5:30 PM"}
                            </span>
                          </p>
                        </div>

                        {!isCompleted && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={completingId === order.id}
                            className="flex items-center gap-1.5 rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-black text-white hover:bg-[#065F46] transition cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            <span>{completingId === order.id ? "Marking..." : "Mark as Received ✓"}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Completed Badge */}
                    {isCompleted && (
                      <div className="mt-3.5 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-xs font-black text-emerald-900">
                        <CheckCircle2 size={16} className="text-emerald-700" />
                        <span>Order Received and Completed by Customer ✓</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="mt-3.5 space-y-2">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
                            <span className="font-bold text-[#450A0A]">{item.name}</span>
                            <span className="rounded bg-[#FEFCE8] px-1.5 py-0.5 text-[10px] font-black text-[#881337] border border-[#FCD34D]">
                              Size {item.size}
                            </span>
                            <span className="text-gray-500">× {item.qty || 1}</span>
                          </div>
                          <span className="font-black text-[#7F1D1D]">
                            ₹{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <p className="text-[11px] font-bold text-gray-500">
                        Delivery to:{" "}
                        <span className="text-gray-700">
                          {typeof order.deliveryAddress === "object" && order.deliveryAddress !== null
                            ? `${order.deliveryAddress.city || ""}, ${order.deliveryAddress.postal || ""}`
                            : (order.deliveryAddress || "Home")}
                        </span>
                      </p>

                      <div className="flex items-center gap-2">
                        <a
                          href={`${API_BASE_URL}/api/orders/${order.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-xl border border-[#9F1239] bg-[#FFF1F2] px-3.5 py-1.5 text-xs font-black text-[#9F1239] hover:bg-[#FFE4E6] transition"
                        >
                          <FileText size={14} /> PDF Order Form
                        </a>

                        <Link
                          href={`/order-confirmation?orderId=${order.id}`}
                          className="flex items-center gap-1 rounded-xl bg-[#881337] px-3.5 py-1.5 text-xs font-black text-white hover:bg-[#9F1239] transition"
                        >
                          <span>Live Tracking</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
