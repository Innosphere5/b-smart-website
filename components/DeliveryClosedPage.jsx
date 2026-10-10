"use client";

import React from "react";
import Image from "next/image";
import { useShopStatus } from "@/lib/ShopStatusContext";
import { Calendar } from "lucide-react";

export default function DeliveryClosedPage() {
  const { reopenDateFormatted } = useShopStatus();

  return (
    <main
      id="delivery-closed-page"
      role="main"
      className="min-h-screen w-full bg-[#FEF8E7] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none"
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Brand Logo & Name */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden bg-white shadow-md border-2 border-[#FACC15] p-1.5 flex items-center justify-center mb-3">
            <Image
              src="/logo.png"
              alt="B'Smart Dresses"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm sm:text-base font-black tracking-wide text-[#881337] uppercase">
            B'Smart Dresses Bathinda
          </p>
        </div>

        {/* Minimal Clean Card */}
        <div className="w-full bg-white rounded-3xl border-2 border-[#FACC15] shadow-xl p-6 sm:p-10 flex flex-col items-center">
          {/* Headline - Exact required text */}
          <h1
            id="closure-headline"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#7F1D1D] leading-snug tracking-tight text-center"
          >
            We are currently not processing any online orders, Please revisit our website after a few business days.
          </h1>

          {/* Off Date / Reopening Date Mention */}
          {reopenDateFormatted && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] text-[#881337]">
              <Calendar size={18} className="text-[#991B1B] shrink-0" />
              <span className="text-sm sm:text-base font-bold">
                Orders Resume On: <span className="font-extrabold text-[#7F1D1D] underline">{reopenDateFormatted}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
