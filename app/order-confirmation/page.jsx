"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  FileText,
  Clock,
  Truck,
  Package,
  CheckCircle,
  Phone,
  MapPin,
  School,
  ArrowRight,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/lib/CartContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function OrderConfirmationPage({ searchParams }) {
  const resolvedParams = searchParams ? (typeof searchParams.then === 'function' ? use(searchParams) : searchParams) : {};
  const orderId = resolvedParams?.orderId || "BS-1024";

  const { activeOrders, completeOrder } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          return;
        }
      }
    } catch (e) {
      // Backend lookup fallback
    }

    // Fallback from CartContext activeOrders
    const found = activeOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (found) {
      setOrder(found);
    } else {
      setOrder({
        id: orderId,
        orderNumber: `#${orderId.replace('-', '')}`,
        customerName: "Rahul Sharma",
        customerMobile: "+91 98765 43210",
        customerEmail: "rahul.sharma@example.com",
        school: "Delhi Public School",
        deliveryAddress: {
          address1: "House No. 142, Street 4, Model Town",
          address2: "Near Kali Mata Temple",
          city: "Bathinda",
          state: "Punjab",
          postal: "151001"
        },
        items: [
          {
            name: "Boys Full-Sleeve White Shirt (Bathinda)",
            school: "Delhi Public School",
            size: "30",
            price: 550,
            qty: 2,
            itemTotal: 1100,
            imageSrc: "/prod-shirt.jpg"
          }
        ],
        subtotal: 1100,
        deliveryFee: 0,
        totalAmount: 1100,
        status: "pending",
        deliveryTime: "",
        createdAt: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCompleteTick = async () => {
    if (!order) return;
    setCompleting(true);
    try {
      await completeOrder(order.id);
      setCompletedSuccess(true);
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const isAccepted = order?.status === "accepted";
  const isCompleted = order?.status === "completed" || order?.userCompleted;

  const STATUS_STEPS = [
    { label: "Order Placed", complete: true, active: order?.status === "pending" },
    {
      label: isAccepted ? `Accepted (${order.deliveryTime || "Scheduled"})` : "Admin Confirmation",
      complete: isAccepted || isCompleted,
      active: isAccepted
    },
    { label: "Out for Delivery", complete: isAccepted || isCompleted, active: isAccepted },
    { label: "Delivered & Verified", complete: isCompleted, active: isCompleted },
  ];

  return (
    <main className="app-frame bg-[#FEF8E7]">
      <Header activeHref="/orders" />

      <div className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        <div className="overflow-hidden rounded-3xl border-2 border-[#FCD34D] bg-white shadow-xl">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#7F1D1D] via-[#9F1239] to-[#881337] px-6 py-8 text-center text-white">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FACC15] text-[#7F1D1D] shadow-lg">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              {isCompleted
                ? "Order Completed & Verified! ✓"
                : isAccepted
                ? "Order Confirmed by School Admin! 🎉"
                : "Order Placed Successfully!"}
            </h1>
            <p className="mt-1 text-xs md:text-sm font-bold text-yellow-100">
              Order Number:{" "}
              <span className="font-mono text-base font-black text-white underline decoration-[#FACC15]">
                {order?.orderNumber || order?.id || `#${orderId}`}
              </span>
            </p>
          </div>

          {/* Admin Live Delivery Time Alert Box */}
          {isAccepted && (
            <div className="border-b-2 border-emerald-400 bg-emerald-50 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Truck size={20} />
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                      Live Delivery Schedule
                    </span>
                    <p className="mt-1 text-sm font-black text-emerald-950">
                      Expected Delivery:{" "}
                      <span className="text-[#881337] underline decoration-[#FACC15]">
                        {order.deliveryTime || "Today by 5:30 PM"}
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-emerald-800">
                      Our school uniform team has packaged your items and is heading to your address.
                    </p>
                  </div>
                </div>

                {!isCompleted ? (
                  <button
                    onClick={handleCompleteTick}
                    disabled={completing}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#047857] px-4 py-2.5 text-xs font-black text-white shadow-md hover:bg-[#065F46] transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <CheckCircle2 size={16} className="text-[#FACC15]" />
                    <span>{completing ? "Marking..." : "Mark as Received ✓"}</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-xl bg-emerald-200 px-3 py-1.5 text-xs font-black text-emerald-900">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Progress Tracker */}
          <div className="border-b-2 border-[#FCD34D]/60 bg-[#FFFDF0] px-6 py-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#9F1239] mb-4">
              Real-Time Order Lifecycle Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATUS_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition ${
                    step.complete
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black mb-1.5 ${
                      step.complete
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-extrabold">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & PDF Download */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Customer Credentials */}
            <div className="rounded-2xl border border-gray-200 bg-[#FAFAF9] p-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#7F1D1D] mb-3">
                Customer &amp; Delivery Destination
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs font-semibold text-gray-700">
                <div>
                  <span className="text-gray-500 block">Recipient Name:</span>
                  <span className="font-bold text-[#450A0A]">{order?.customerName || "Customer"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Mobile Contact:</span>
                  <span className="font-bold text-[#881337]">{order?.customerMobile || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">School / Institution:</span>
                  <span className="font-bold text-[#450A0A]">{order?.school || "General School"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Delivery Address:</span>
                  <span className="font-bold text-[#450A0A]">
                    {typeof order?.deliveryAddress === "object" && order?.deliveryAddress !== null
                      ? `${order.deliveryAddress.address1 || ""} ${order.deliveryAddress.address2 || ""}, ${order.deliveryAddress.city || ""} ${order.deliveryAddress.state || ""} - ${order.deliveryAddress.postal || ""}`
                      : (order?.deliveryAddress || "Standard Delivery Address")}
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#7F1D1D] mb-3">
                Ordered Uniform Items
              </h3>
              <div className="space-y-3">
                {(order?.items || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FFFDF0] border border-[#FDE047] p-1 flex items-center justify-center">
                        <img
                          src={item.imageSrc || "/prod-shirt.jpg"}
                          alt={item.name}
                          className="h-full w-full object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#450A0A]">{item.name}</p>
                        <p className="text-[11px] font-bold text-gray-500">
                          Size: <span className="text-[#881337] font-black">{item.size}</span> • Qty: {item.qty || 1}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-[#9F1239]">
                      ₹{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="mt-4 border-t-2 border-[#FCD34D] pt-3 flex justify-between items-center text-sm">
                <span className="font-black text-[#7F1D1D]">Total Paid (COD/UPI):</span>
                <span className="text-lg font-black text-[#9F1239]">
                  ₹{order?.totalAmount || order?.subtotal || 0}
                </span>
              </div>
            </div>

            {/* Action Bar: PDF Invoice & Continue Shopping */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`${API_BASE_URL}/api/orders/${order?.id || orderId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black shadow-md hover:shadow-lg transition"
              >
                <FileText size={18} /> Download / Print PDF Invoice
              </a>

              <Link
                href="/"
                className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-black border-2 border-[#7F1D1D] text-[#7F1D1D] hover:bg-[#FFFDF0]"
              >
                <ShoppingBag size={18} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
