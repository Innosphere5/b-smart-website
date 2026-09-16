"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { signInWithEmail, signInWithGoogle, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setLoadingEmail(true);
    try {
      await signInWithEmail(email, password);
      router.push(redirectUrl);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError("");
    clearError();
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      router.push(redirectUrl);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md rounded-3xl border-2 border-[#FCD34D] bg-white p-6 sm:p-8 shadow-2xl">
      {/* Brand Header */}
      <div className="text-center">
        <div className="mx-auto inline-flex items-center justify-center rounded-2xl bg-[#881337] p-2.5 shadow-md">
          <Image
            src="/logo.jpg"
            alt="B'Smart Dresses"
            width={70}
            height={32}
            className="h-8 w-auto object-contain rounded"
          />
        </div>


        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#881337]">
          Welcome Back
        </h1>
        <p className="mt-1 text-xs font-semibold text-gray-500">
          Sign in to view orders, track delivery & manage saved info.
        </p>
      </div>

      {/* Error Alert */}
      {displayError && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-900 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">{displayError}</div>
        </div>
      )}

      {/* Google Sign In Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle || loadingEmail}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-xs sm:text-sm font-black text-gray-800 shadow-sm transition hover:border-[#FCD34D] hover:bg-gray-50 hover:shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {loadingGoogle ? (
            <Loader2 size={18} className="animate-spin text-[#881337]" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.36 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          or with email
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-black text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-black text-[#881337] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/60 pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#881337] focus:bg-white focus:outline-hidden transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loadingEmail || loadingGoogle}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#881337] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-lg transition hover:bg-[#9F1239] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {loadingEmail ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer link to Register */}
      <p className="mt-6 text-center text-xs font-bold text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-black text-[#881337] hover:underline"
        >
          Create New Account
        </Link>
      </p>

      {/* Security badge */}
      <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-4 text-[10px] font-bold text-gray-400">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>256-Bit SSL Encrypted & Firebase Verified</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
      <Header activeHref="/account" />

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#881337]" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
