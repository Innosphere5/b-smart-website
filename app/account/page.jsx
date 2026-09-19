"use client";

import { useState, useRef } from "react";
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
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  X,
  Check,
} from "lucide-react";

// Official Google Multicolored Icon
function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Client-side Image Resizer & Optimizer for instant, crisp avatar uploads
function compressAvatar(file, maxSize = 360, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = document.createElement("img");
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Crop to square from center
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        const canvas = document.createElement("canvas");
        const targetSize = Math.min(minDim, maxSize);
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = readerEvent.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, updateUserProfile, sendPasswordReset } = useAuth();
  const { cartCount, activeOrders } = useCart();
  const { showNotification } = useNotifications();

  // Name Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Photo Upload Modal & State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoData, setSelectedPhotoData] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef(null);

  // Google / Gmail identification
  const isGoogleAuth = user?.providerData?.some((p) => p.providerId === "google.com");
  const isGmailEmail = Boolean(user?.email?.toLowerCase().endsWith("@gmail.com"));
  const isGoogleAccount = isGoogleAuth || isGmailEmail;

  // Detect original Google photo from providerData or existing Google URL
  const googlePhoto =
    user?.providerData?.find((p) => p.providerId === "google.com" && p.photoURL)?.photoURL ||
    (user?.photoURL?.includes("googleusercontent.com") ? user.photoURL : null) ||
    (isGoogleAccount && user?.email ? `https://unavatar.io/google/${encodeURIComponent(user.email)}` : null);

  const currentAvatar = user?.photoURL || (isGoogleAccount ? googlePhoto : null);

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
      showNotification?.("Profile name updated successfully", "success");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size should be less than 5MB.");
      return;
    }

    try {
      const compressedData = await compressAvatar(file);
      setSelectedPhotoData(compressedData);
    } catch (err) {
      console.error("Compression error:", err);
      setPhotoError("Failed to process image. Please try another photo.");
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhotoData) return;

    setUploadingPhoto(true);
    setPhotoError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedPhotoData,
          folder: "bsmart_avatars",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || "Failed to upload photo to CDN");
      }

      await updateUserProfile({ photoURL: data.url });
      setImgError(false);
      setSelectedPhotoData(null);
      setShowPhotoModal(false);
      showNotification?.("Profile photo updated successfully!", "success");
    } catch (err) {
      console.error("Upload failed:", err);
      setPhotoError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUseGooglePhoto = async () => {
    if (!googlePhoto) return;
    setUploadingPhoto(true);
    setPhotoError("");

    try {
      await updateUserProfile({ photoURL: googlePhoto });
      setImgError(false);
      setSelectedPhotoData(null);
      setShowPhotoModal(false);
      showNotification?.("Profile photo synced with Google / Gmail!", "success");
    } catch (err) {
      setPhotoError(err.message || "Failed to sync Google photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    setPhotoError("");

    try {
      await updateUserProfile({ photoURL: "" });
      setImgError(false);
      setSelectedPhotoData(null);
      setShowPhotoModal(false);
      showNotification?.("Custom profile photo removed", "success");
    } catch (err) {
      setPhotoError(err.message || "Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
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

  // If unauthenticated
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
              {/* Profile Avatar with Gmail Badge & Quick Camera Trigger */}
              <div className="relative group">
                <div className="relative h-18 w-18 sm:h-22 sm:w-22 overflow-hidden rounded-2xl sm:rounded-3xl border-3 border-[#FACC15] shadow-xl bg-[#FEF08A] flex items-center justify-center">
                  {currentAvatar && !imgError ? (
                    <img
                      src={currentAvatar}
                      alt={user.displayName || "User"}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#FACC15] text-[#881337] font-black text-2xl sm:text-3xl">
                      {userInitials}
                    </div>
                  )}

                  {/* Desktop Hover Camera Overlay */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhotoData(null);
                      setPhotoError("");
                      setShowPhotoModal(true);
                    }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    title="Change / Upload Photo"
                  >
                    <Camera size={20} className="text-[#FACC15]" />
                    <span className="text-[9px] font-black tracking-tight mt-0.5">Upload</span>
                  </button>
                </div>

                {/* Camera Click Badge (Visible on Mobile & Desktop) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotoData(null);
                    setPhotoError("");
                    setShowPhotoModal(true);
                  }}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#FACC15] text-[#881337] border-2 border-[#881337] shadow-lg hover:bg-[#FEF08A] hover:scale-110 active:scale-95 transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera size={14} />
                </button>

                {/* Google/Gmail Icon Badge */}
                {isGoogleAccount && (
                  <div
                    className="absolute -top-1.5 -left-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md ring-2 ring-[#881337]/20"
                    title={isGoogleAuth ? "Google Account Connected" : "Gmail Account Verified"}
                  >
                    <GoogleIcon className="h-4 w-4" />
                  </div>
                )}
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
                  {isGoogleAccount && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black text-white border border-white/30 shadow-xs">
                      <GoogleIcon className="h-3 w-3" />
                      <span>{isGoogleAuth ? "Google Account" : "Gmail Linked"}</span>
                    </span>
                  )}
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

                {/* Dedicated Photo Upload Action Button */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhotoData(null);
                      setPhotoError("");
                      setShowPhotoModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3 py-1 text-[11px] font-black text-[#881337] shadow-xs hover:bg-[#EAB308] hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Camera size={12} />
                    <span>Upload Photo</span>
                  </button>
                  {isGoogleAccount && googlePhoto && currentAvatar !== googlePhoto && (
                    <button
                      type="button"
                      onClick={handleUseGooglePhoto}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/15 border border-white/30 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/25 transition cursor-pointer"
                    >
                      <GoogleIcon className="h-3 w-3" />
                      <span>Sync Gmail Photo</span>
                    </button>
                  )}
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

        {/* Main Content Grid: Profile Details & Security */}
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
                  <span className="font-bold text-gray-500">Profile Photo</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      {user.photoURL ? "Custom / Cloudinary" : isGoogleAccount ? "Google Avatar" : "Initials"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhotoData(null);
                        setPhotoError("");
                        setShowPhotoModal(true);
                      }}
                      className="text-[#881337] font-black underline hover:text-[#9F1239] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="font-bold text-gray-500">Authentication</span>
                  <span className="inline-flex items-center gap-1.5 font-black text-[#881337]">
                    {isGoogleAuth ? (
                      <>
                        <GoogleIcon className="h-3.5 w-3.5" />
                        <span>Google OAuth (Gmail)</span>
                      </>
                    ) : isGmailEmail ? (
                      <>
                        <GoogleIcon className="h-3.5 w-3.5" />
                        <span>Gmail Email & Password</span>
                      </>
                    ) : (
                      <span>Email & Password</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Security & Password */}
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

      {/* ========================================================================= */}
      {/* PHOTO UPLOAD & GMAIL SYNC MODAL                                           */}
      {/* ========================================================================= */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#FCD34D] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                if (!uploadingPhoto) {
                  setShowPhotoModal(false);
                  setSelectedPhotoData(null);
                  setPhotoError("");
                }
              }}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF08A] text-[#881337] border border-[#FCD34D]">
                <Camera size={18} />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  Update Profile Photo
                </h3>
                <p className="text-[11px] font-semibold text-gray-500">
                  Upload a custom photo or sync with your Google / Gmail
                </p>
              </div>
            </div>

            {/* Error Message */}
            {photoError && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Circular Preview Section */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border-4 border-[#FACC15] shadow-xl bg-[#FEF08A] flex items-center justify-center">
                {selectedPhotoData ? (
                  <img
                    src={selectedPhotoData}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : currentAvatar && !imgError ? (
                  <img
                    src={currentAvatar}
                    alt="Current Avatar"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#FACC15] text-[#881337] font-black text-3xl">
                    {userInitials}
                  </div>
                )}

                {/* Google badge on preview */}
                {isGoogleAccount && (
                  <div className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md">
                    <GoogleIcon className="h-4 w-4" />
                  </div>
                )}
              </div>

              <span className="mt-2 text-xs font-extrabold text-gray-600">
                {selectedPhotoData
                  ? "New Photo Preview (Ready to Save)"
                  : user.photoURL
                  ? "Current Profile Photo"
                  : isGoogleAccount
                  ? "Google / Gmail Avatar"
                  : "Default Initials"}
              </span>
            </div>

            {/* Photo Action Options */}
            <div className="space-y-2.5">
              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Option 1: Pick from Device */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-[#FCD34D] bg-[#FEFCE8] py-2.5 px-4 text-xs font-black text-[#881337] hover:bg-[#FEF08A] transition cursor-pointer shadow-xs active:scale-98"
              >
                <Upload size={15} />
                <span>Choose Photo from Device / Gallery</span>
              </button>

              {/* Option 2: Sync with Google / Gmail Photo (if Google account) */}
              {isGoogleAccount && googlePhoto && (
                <button
                  type="button"
                  onClick={handleUseGooglePhoto}
                  disabled={uploadingPhoto}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-xs font-bold text-gray-800 hover:bg-gray-100 transition cursor-pointer shadow-xs active:scale-98"
                >
                  <GoogleIcon className="h-4 w-4" />
                  <span>Use Official Google / Gmail Photo</span>
                </button>
              )}

              {/* Option 3: Remove custom photo */}
              {user.photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploadingPhoto}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/50 py-2 px-4 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoModal(false);
                  setSelectedPhotoData(null);
                  setPhotoError("");
                }}
                disabled={uploadingPhoto}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>

              {selectedPhotoData && (
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 rounded-xl bg-[#881337] px-5 py-2 text-xs font-black text-white hover:bg-[#9F1239] transition cursor-pointer shadow-md active:scale-95"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Photo...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Profile Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
