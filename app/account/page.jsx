"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, Clock, ArrowLeft } from "lucide-react";

export default function AccountPage() {
  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad min-h-screen flex flex-col justify-between">
      <Header activeHref="/account" />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-6 sm:p-10 text-center shadow-xl">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#FFF1F2] text-[#9F1239] border-2 border-[#FECDD3] shadow-inner mb-5 sm:mb-6">
            <User size={36} className="text-[#9F1239]" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FACC15] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#7F1D1D] shadow-xs mb-3">
            <Clock size={13} />
            <span>Coming Soon</span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-black text-[#7F1D1D] tracking-tight">
            Create Your Account
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
            Create your account feature soon available.
          </p>

          {/* Action button */}
          <div className="mt-6 sm:mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-xs sm:text-sm font-black text-[#7F1D1D] shadow-md transition-all hover:bg-[#EAB308] hover:shadow-lg active:scale-95"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
