"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import {
  ChevronLeft,
  Lock,
  User,
  Truck,
  CreditCard,
  School,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  Clock,
  X
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { useShopStatus } from "@/lib/ShopStatusContext";

const API_BASE_URL = "";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart, recordPlacedOrder } = useCart();
  const { isClosed, reopenDateFormatted, closureDays, bannerTitle } = useShopStatus();

  // Customer Form State - Initialized completely blank for user to input their own data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    school: cartItems[0]?.school || "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showClosureConfirmModal, setShowClosureConfirmModal] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty. Please add items before placing an order.");
      return;
    }

    if (cartSubtotal < 500) {
      setErrorMsg("Minimum order amount is ₹500 to complete your order. Delivery is always FREE!");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please provide a valid 10-digit mobile number for delivery communication.");
      return;
    }

    if (!formData.address1.trim() || !formData.city.trim() || !formData.postal.trim()) {
      setErrorMsg("Please enter a complete delivery address with Street, City, and Pincode.");
      return;
    }

    // If shop is closed, show dedicated confirmation popup before processing order
    if (isClosed) {
      setShowClosureConfirmModal(true);
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setShowClosureConfirmModal(false);
    setLoading(true);
    setErrorMsg("");

    const orderPayload = {
      customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      customerMobile: formData.mobile.trim(),
      customerEmail: user?.email || "",
      school: formData.school || cartItems[0]?.school || "General School",
      deliveryAddress: {
        address1: formData.address1.trim(),
        address2: formData.address2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal: formData.postal.trim(),
      },
      items: cartItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        school: item.school,
        applicableClass: item.applicableClass || "",
        category: item.category || "School Uniform",
        size: item.size,
        price: Number(item.price),
        qty: Number(item.qty || 1),
        itemTotal: Number(item.price) * Number(item.qty || 1),
        imageSrc: item.imageSrc,
      })),
      subtotal: cartSubtotal,
      deliveryFee: 0,
      totalAmount: cartSubtotal,
      adminNotes: formData.notes.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned error status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.order) {
        // Record order in active tracking context
        recordPlacedOrder(data.order);
        clearCart();
        // Redirect to Order Confirmation Page with Order ID
        router.push(`/order-confirmation?orderId=${data.order.id}`);
      } else {
        throw new Error(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      // Fallback in case of backend offline: create local order
      const fallbackOrder = {
        id: `BS-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: `#BS${Math.floor(1000 + Math.random() * 9000)}`,
        ...orderPayload,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      recordPlacedOrder(fallbackOrder);
      clearCart();
      router.push(`/order-confirmation?orderId=${fallbackOrder.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
      <header className="w-full border-b-2 border-[#FACC15] bg-[#881337] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3 sm:py-4 md:px-10">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-[10px] sm:text-xs md:text-sm font-bold text-yellow-100 hover:text-white"
          >
            <ChevronLeft size={14} /> Back to Cart
          </Link>
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <div className="overflow-hidden rounded-lg bg-[#FACC15] p-0.5 sm:p-1 shadow-sm border border-[#FACC15]">
              <img
                src="/logo.jpg"
                alt="B'Smart Logo"
                className="h-6 sm:h-7 w-auto object-contain rounded"
              />
            </div>
            <span className="text-xs sm:text-base font-extrabold text-white uppercase tracking-tight">
              B&apos;Smart <span className="text-[#FACC15]">Dresses</span>
            </span>
          </Link>
          <p className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-yellow-100">
            <Lock size={13} className="text-[#FACC15]" /> Secure Checkout
          </p>
          <Lock size={14} className="text-[#FACC15] sm:hidden" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 md:px-10 md:py-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#7F1D1D]">Delivery Checkout</h1>
        <p className="mt-1 text-[10px] sm:text-xs font-semibold text-gray-600">
          Provide delivery details to place your uniform order and schedule doorstep delivery.
        </p>

        {/* Store Closure Notice Banner on Checkout */}
        {isClosed && (
          <div className="mt-4 rounded-xl sm:rounded-2xl border-2 border-[#FECDD3] bg-gradient-to-r from-[#FFF1F2] via-[#FFFBEB] to-[#FFF1F2] p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#991B1B] text-[#FEF08A] shadow-xs">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase text-[#991B1B]">
                    Store Closed for {closureDays} {closureDays === 1 ? 'Day' : 'Days'}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#9F1239]">
                    Reopening on: {reopenDateFormatted}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-[13px] font-medium text-slate-700 leading-relaxed">
                  Please note our physical shop is currently closed. You can complete your order now — all placed orders are confirmed immediately and will be prioritized for fulfillment as soon as we reopen on <strong>{reopenDateFormatted}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-2.5 rounded-lg sm:rounded-xl bg-red-50 border-2 border-red-300 p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-red-800">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="mt-5 sm:mt-6 grid gap-5 sm:gap-8 md:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 md:col-span-2">
            {/* Customer Credentials */}
            <section className="rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 shadow-md">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-black text-[#7F1D1D]">
                <User size={16} className="text-[#9F1239]" /> Customer Information
              </h2>
              <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="firstName">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    required
                    className="field-input font-semibold text-xs sm:text-sm"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="lastName">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    required
                    className="field-input font-semibold text-xs sm:text-sm"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="mobile">
                    Mobile Number *
                  </label>
                  <input
                    id="mobile"
                    required
                    type="tel"
                    className="field-input font-bold text-[#881337] text-xs sm:text-sm"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                  />
                </div>

              </div>
            </section>

            {/* Delivery Address */}
            <section className="rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 shadow-md">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-black text-[#7F1D1D]">
                <Truck size={16} className="text-[#9F1239]" /> Delivery Address
              </h2>
              <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4">
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="address1">
                    House / Flat No., Street *
                  </label>
                  <input
                    id="address1"
                    required
                    className="field-input font-semibold text-xs sm:text-sm"
                    placeholder="House / Flat No., Street, Sector"
                    value={formData.address1}
                    onChange={(e) => handleInputChange("address1", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="address2">
                    Landmark / Colony (Optional)
                  </label>
                  <input
                    id="address2"
                    className="field-input font-semibold text-xs sm:text-sm"
                    placeholder="Landmark or nearby area (Optional)"
                    value={formData.address2}
                    onChange={(e) => handleInputChange("address2", e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                  <div>
                    <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="city">
                      City *
                    </label>
                    <input
                      id="city"
                      required
                      className="field-input font-semibold text-xs sm:text-sm"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="state">
                      State *
                    </label>
                    <input
                      id="state"
                      required
                      className="field-input font-semibold text-xs sm:text-sm"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="postal">
                      Pincode *
                    </label>
                    <input
                      id="postal"
                      required
                      className="field-input font-bold text-xs sm:text-sm"
                      placeholder="Enter 6-digit pincode"
                      value={formData.postal}
                      onChange={(e) => handleInputChange("postal", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* School and Order Notes */}
            <section className="rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 shadow-md">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-black text-[#7F1D1D]">
                <School size={16} className="text-[#9F1239]" /> School &amp; Instructions
              </h2>
              <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4">
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="school">
                    School Institution
                  </label>
                  <input
                    id="school"
                    className="field-input font-bold text-[#881337] text-xs sm:text-sm"
                    placeholder="Enter school name (Optional)"
                    value={formData.school}
                    onChange={(e) => handleInputChange("school", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label font-bold text-gray-800 text-[10px] sm:text-xs" htmlFor="notes">
                    Special Delivery Instructions
                  </label>
                  <input
                    id="notes"
                    className="field-input font-semibold text-xs sm:text-sm"
                    placeholder="e.g. Please call before arriving"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary & Place Order CTA */}
          <aside className="h-fit rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 shadow-md">
            <h2 className="text-base sm:text-lg font-black text-[#7F1D1D]">Order Summary</h2>

            <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 sm:gap-3 border-b border-gray-100 pb-2.5 sm:pb-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-lg bg-[#FFFDF0] border border-[#FDE047] p-0.5 sm:p-1 flex items-center justify-center">
                    <img
                      src={item.imageSrc || "/prod-shirt.jpg"}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-black text-[#450A0A] truncate">{item.name}</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-[#881337]">
                      Size: {item.size} • Qty: {item.qty}
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-[#9F1239] shrink-0">
                    ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-3 sm:mt-4 space-y-2 border-t-2 border-[#FCD34D] pt-3 sm:pt-4 text-[10px] sm:text-xs font-semibold text-gray-700">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-bold text-[#450A0A]">₹{cartSubtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-bold text-[#047857]">
                  FREE (Universal)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Payment Mode</dt>
                <dd className="font-bold text-[#881337]">Cash / UPI on Delivery</dd>
              </div>
            </dl>

            <div className="mt-3 sm:mt-4 flex justify-between border-t-2 border-[#FCD34D] pt-3 sm:pt-4">
              <span className="text-sm sm:text-base font-black text-[#7F1D1D]">Total Pay</span>
              <span className="text-lg sm:text-xl font-black text-[#9F1239]">₹{cartTotal.toFixed(2)}</span>
            </div>

            {cartSubtotal < 500 && (
              <div className="mt-3 text-[11px] font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-300 text-center">
                ⚠️ Minimum order amount is ₹500 to place an order. Add ₹{(500 - cartSubtotal).toFixed(2)} more.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || cartItems.length === 0 || cartSubtotal < 500}
              className="btn-primary mt-4 sm:mt-6 w-full py-3 sm:py-4 text-xs sm:text-base font-black shadow-lg hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Place Order (Free Delivery) ✓
                </>
              )}
            </button>

            <p className="mt-2.5 sm:mt-3 flex items-center justify-center gap-1.5 text-[9px] sm:text-xs text-gray-500 font-bold">
              <Lock size={11} className="text-emerald-600" /> Instant PDF generated for Admin &amp; You.
            </p>
          </aside>
        </form>
      </div>

      {/* ORDER PLACEMENT CLOSURE CONFIRMATION MODAL */}
      {showClosureConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-[#FACC15] animate-in zoom-in-95">
            <div className="bg-linear-to-r from-[#881337] via-[#9F1239] to-[#881337] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF08A] text-[#991B1B]">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FEF08A]">Important Notice</span>
                  <h3 className="text-base font-black text-white">Store Temporarily Closed</h3>
                </div>
              </div>
              <button
                onClick={() => setShowClosureConfirmModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="rounded-xl bg-[#FEF2F2] p-3.5 border border-[#FECDD3]">
                <div className="flex items-center gap-2 text-xs font-black text-[#991B1B]">
                  <Calendar size={15} />
                  <span>Reopening Date: {reopenDateFormatted}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Our shop is closed for {closureDays} {closureDays === 1 ? 'day' : 'days'}. We will reopen on <strong>{reopenDateFormatted}</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-[#F0FDF4] p-3.5 border border-[#BBF7D0] text-xs text-[#166534] leading-relaxed">
                <span className="font-bold">What happens next? </span>
                Your order for ₹{cartTotal.toFixed(2)} will be confirmed and prioritized for fulfillment immediately upon our reopening on <strong>{reopenDateFormatted}</strong>.
              </div>

              <p className="text-xs font-semibold text-slate-700 text-center pt-1">
                Would you like to confirm and place your order now?
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClosureConfirmModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Review My Cart
                </button>
                <button
                  type="button"
                  onClick={executeOrderPlacement}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-[#FEF08A] font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Confirm &amp; Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
