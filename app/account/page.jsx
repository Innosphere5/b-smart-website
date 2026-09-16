"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useNotifications } from "@/lib/NotificationContext";
import {
  User,
  Mail,
  Package,
  ShoppingCart,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  KeyRound,
  ExternalLink,
  Edit2,
  Loader2,
  AlertCircle,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, updateUserProfile, sendPasswordReset } = useAuth();
  const { cartCount, activeOrders } = useCart();
  const { showNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartEdit = () => {
    setNameInput(user?.displayName || "");
    setIsEditing(true);
    setErrorMsg("");
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSavingName(true);
    setErrorMsg("");
    try {
      await updateUserProfile({ displayName: nameInput.trim() });
      setIsEditing(false);
      showNotification?.("Profile updated successfully", "success");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setErrorMsg("");
    try {
      await sendPasswordReset(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 8000);
      showNotification?.("Password reset link sent to your email", "success");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
        <Header activeHref="/account" />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#881337]" />
            <p className="text-xs font-bold text-[#881337]">Loading your account...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // If unauthenticated (e.g. while middleware redirect executes)
  if (!user) {
    return (
      <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
        <Header activeHref="/account" />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#FCD34D] bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#881337] border-2 border-[#FECDD3] mb-4">
              <User size={32} />
            </div>
            <h1 className="text-xl font-black text-[#881337]">Sign In Required</h1>
            <p className="mt-1 text-xs text-gray-500 font-semibold">
              Please sign in to access your personal dashboard and orders.
            </p>
            <Link
              href="/login?redirect=/account"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#881337] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-[#9F1239] transition"
            >
              Sign In to B&apos;Smart
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const creationDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  const userInitials =
    user.displayName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    user.email?.slice(0, 2).toUpperCase() ||
    "BS";

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
      <Header activeHref="/account" />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        {/* Profile Header Banner */}
        <div className="overflow-hidden rounded-3xl border-2 border-[#FCD34D] bg-gradient-to-br from-[#881337] to-[#5F0C24] p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative">
                {user.photoURL ? (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#FACC15] shadow-lg">
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#FACC15] text-[#881337] font-black text-xl sm:text-2xl border-2 border-[#FEF08A] shadow-lg">
                    {userInitials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-[#881337] shadow-sm" title="Active">
                  <CheckCircle2 size={13} />
                </div>
              </div>

              {/* User Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {user.displayName || "Valued Customer"}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FACC15] px-2.5 py-0.5 text-[10px] font-black text-[#881337] shadow-xs uppercase">
                    <Sparkles size={11} /> Parent Account
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#FEF08A] font-medium">
                  <span className="flex items-center gap-1">
                    <Mail size={13} />
                    {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    Member since {creationDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/20 transition active:scale-95 cursor-pointer shrink-0"
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/orders"
            className="group rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-5 shadow-sm hover:border-[#881337] hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#FFF1F2] p-2 text-[#881337] group-hover:scale-110 transition-transform">
                <Package size={20} />
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#881337]">
                {activeOrders?.length || 0}
              </span>
            </div>
            <p className="mt-3 text-xs font-black text-gray-900">Active Orders</p>
            <p className="text-[11px] font-semibold text-gray-500">Track delivery & status</p>
          </Link>

          <Link
            href="/cart"
            className="group rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-5 shadow-sm hover:border-[#881337] hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#FEFCE8] p-2 text-[#CA8A04] group-hover:scale-110 transition-transform">
                <ShoppingCart size={20} />
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#881337]">
                {cartCount || 0}
              </span>
            </div>
            <p className="mt-3 text-xs font-black text-gray-900">Cart Items</p>
            <p className="text-[11px] font-semibold text-gray-500">Ready for checkout</p>
          </Link>

          <div className="col-span-2 sm:col-span-1 rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <MapPin size={20} />
              </span>
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                Bathinda, PB
              </span>
            </div>
            <p className="mt-3 text-xs font-black text-gray-900">Delivery Coverage</p>
            <p className="text-[11px] font-semibold text-gray-500">Fast doorstep service</p>
          </div>
        </div>

        {/* Main Content Grid: Profile Settings & Security */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Profile Details */}
          <div className="rounded-3xl border-2 border-[#FCD34D] bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#881337]" />
                <h2 className="text-sm sm:text-base font-black text-gray-900">
                  Profile Details
                </h2>
              </div>
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 rounded-xl bg-[#FEFCE8] border border-[#FCD34D] px-3 py-1 text-xs font-black text-[#881337] hover:bg-[#FEF08A] transition cursor-pointer"
                >
                  <Edit2 size={12} /> Edit Name
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-bold">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveName} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-900 focus:border-[#881337] focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="flex items-center gap-1.5 rounded-xl bg-[#881337] px-4 py-2 text-xs font-black text-white hover:bg-[#9F1239] transition cursor-pointer"
                  >
                    {savingName && <Loader2 size={13} className="animate-spin" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="font-bold text-gray-500">Full Name</span>
                  <span className="font-black text-gray-900">
                    {user.displayName || "Not set"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="font-bold text-gray-500">Email Address</span>
                  <span className="font-black text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="font-bold text-gray-500">Account Type</span>
                  <span className="font-black text-[#881337]">
                    {user.providerData[0]?.providerId === "google.com"
                      ? "Google OAuth"
                      : "Email & Password"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Security & Quick Actions */}
          <div className="rounded-3xl border-2 border-[#FCD34D] bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck size={18} className="text-[#881337]" />
                <h2 className="text-sm sm:text-base font-black text-gray-900">
                  Security & Password
                </h2>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                  Need to change or reset your password? We will dispatch an official reset link directly to your inbox.
                </p>

                {resetSent && (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Password reset email dispatched to {user.email}!</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-[#FCD34D] bg-[#FEFCE8] px-4 py-2.5 text-xs font-black text-[#881337] hover:bg-[#FEF08A] transition cursor-pointer"
                >
                  <KeyRound size={15} /> Send Password Reset Email
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#881337] hover:underline"
              >
                <span>View Order History</span>
                <ExternalLink size={13} />
              </Link>
              <Link
                href="/"
                className="text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
