"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { sendPasswordReset, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim()) {
      setLocalError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSentSuccess(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
      <Header activeHref="/account" />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md rounded-3xl border-2 border-[#FCD34D] bg-white p-6 sm:p-8 shadow-2xl">
          {/* Brand Header */}
          <div className="text-center">
            <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-[#881337] p-3 shadow-md text-[#FACC15]">
              <KeyRound size={28} />
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#881337]">
              Reset Your Password
            </h1>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              Enter your registered email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Success Screen */}
          {sentSuccess ? (
            <div className="mt-6 text-center animate-in fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-base font-black text-gray-900">
                Reset Link Dispatched
              </h2>
              <p className="mt-1.5 text-xs text-gray-600 font-semibold leading-relaxed">
                We sent a password recovery email to{" "}
                <span className="font-black text-[#881337]">{email}</span>. Please check your inbox and spam folder.
              </p>
              <div className="mt-6 space-y-2.5">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#881337] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-[#9F1239] transition cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setSentSuccess(false)}
                  className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-700 py-1 cursor-pointer"
                >
                  Didn&apos;t get the email? Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {displayError && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-900 animate-in fade-in">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{displayError}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#881337] focus:bg-white focus:outline-hidden transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#881337] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg transition hover:bg-[#9F1239] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#881337] hover:underline"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Secure Firebase Recovery</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
