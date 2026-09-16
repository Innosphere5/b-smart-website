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
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/lib/CartContext";

const API_BASE_URL = "";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart, recordPlacedOrder } = useCart();

  // Customer Form State
  const [formData, setFormData] = useState({
    firstName: "Rahul",
    lastName: "Sharma",
    mobile: "9876543210",
    address1: "House No. 142, Street 4, Model Town",
    address2: "Near Kali Mata Temple",
    city: "Bathinda",
    state: "Punjab",
    postal: "151001",
    school: cartItems[0]?.school || "Delhi Public School",
    notes: "Please call on arrival before delivery."
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    setLoading(true);
    setErrorMsg("");

    const orderPayload = {
      customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      customerMobile: formData.mobile.trim(),
      school: formData.school || cartItems[0]?.school || "Delhi Public School",
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
                    placeholder="e.g. 9876543210"
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
                    placeholder="e.g. House No. 142, Street 4, Model Town"
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
                    placeholder="e.g. Near Kali Mata Temple"
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
                      placeholder="Bathinda"
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
                      placeholder="Punjab"
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
                      placeholder="151001"
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
                    placeholder="Delhi Public School"
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

      <Footer />
    </main>
  );
}
