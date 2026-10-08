"use client";

import React from 'react';
import { useShopStatus } from '@/lib/ShopStatusContext';
import { AlertTriangle, Calendar, ChevronRight, Info } from 'lucide-react';

export default function ShopClosureBanner() {
  const { isClosed, showTopBanner, reopenDateFormatted, closureDays, bannerTitle, openPopup } =
    useShopStatus();

  if (!isClosed || !showTopBanner) return null;

  return (
    <aside
      aria-label="Store Closure Notification"
      className="relative z-40 w-full bg-linear-to-r from-[#7F1D1D] via-[#991B1B] to-[#7F1D1D] text-white shadow-md border-b-2 border-[#FACC15]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        {/* Left: Badge + Headline */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[260px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF08A] text-[#7F1D1D] font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 shadow-xs shrink-0 animate-pulse">
            <AlertTriangle size={13} className="text-[#B91C1C]" />
            STORE NOTICE
          </span>

          <p className="font-semibold text-white/95 text-xs sm:text-[13px] leading-tight">
            <span className="font-bold text-[#FEF08A] mr-1">
              Shop Closed for {closureDays} {closureDays === 1 ? 'Day' : 'Days'}:
            </span>
            <span>Reopening on </span>
            <span className="font-black text-[#FDE047] underline decoration-[#FDE047]/60 underline-offset-2">
              {reopenDateFormatted}
            </span>
            <span className="hidden md:inline text-white/80 text-[12px] ml-2">
              • Online orders placed now are queued for priority dispatch
            </span>
          </p>
        </div>

        {/* Right: Real Date Pill & View Details Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:inline-flex items-center gap-1 bg-black/25 backdrop-blur-xs border border-white/20 px-2.5 py-1 rounded-md text-[11px] font-bold text-white/90">
            <Calendar size={12} className="text-[#FDE047]" />
            <span>Reopens: {reopenDateFormatted}</span>
          </div>

          <button
            onClick={openPopup}
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-[#FEF08A] hover:bg-[#FACC15] text-[#7F1D1D] font-black text-[11px] sm:text-xs px-2.5 py-1 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Info size={12} />
            <span>View Notice</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
