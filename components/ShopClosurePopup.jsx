"use client";

import React, { useEffect } from 'react';
import { useShopStatus } from '@/lib/ShopStatusContext';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Phone,
  ShoppingBag,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function ShopClosurePopup() {
  const {
    isClosed,
    isPopupOpen,
    closureDays,
    reopenDateFormatted,
    bannerTitle,
    bannerMessage,
    allowOrders,
    acknowledgePopup,
    closePopup,
  } = useShopStatus();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPopupOpen) {
        acknowledgePopup();
      }
    };
    if (isPopupOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isPopupOpen, acknowledgePopup]);

  if (!isClosed || !isPopupOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="closure-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border-2 border-[#FACC15] animate-in zoom-in-95 duration-200">
        {/* Luxury Brand Header */}
        <div className="bg-linear-to-r from-[#881337] via-[#9F1239] to-[#881337] px-5 py-4 text-white relative">
          {/* Close Button */}
          <button
            onClick={acknowledgePopup}
            type="button"
            aria-label="Close notification"
            className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF08A] text-[#7F1D1D] shadow-md">
              <AlertTriangle size={22} className="text-[#991B1B]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#FEF08A]">
                <Sparkles size={11} />
                B'Smart Store Notice
              </span>
              <h2 id="closure-popup-title" className="text-base sm:text-lg font-black leading-tight text-white">
                {bannerTitle || `Shop Temporarily Closed for ${closureDays} Days`}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Big Real Date Highlight Box */}
          <div className="rounded-xl bg-linear-to-r from-[#FEF2F2] to-[#FFFBEB] p-4 border border-[#FECDD3] shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#991B1B] text-[#FEF08A] shadow-xs">
                <Calendar size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#991B1B]">
                  Reopening Calendar Date
                </p>
                <p className="text-base sm:text-lg font-black text-[#1E293B] mt-0.5">
                  {reopenDateFormatted}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-[11px] font-bold text-[#991B1B]">
                  <Clock size={11} />
                  <span>Closed for {closureDays} {closureDays === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Message */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
            <p className="whitespace-pre-line font-medium">{bannerMessage}</p>
          </div>

          {/* Ordering Policy Notice */}
          {allowOrders && (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#F0FDF4] p-3.5 border border-[#BBF7D0]">
              <CheckCircle2 size={18} className="text-[#16A34A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#166534] leading-relaxed">
                <span className="font-bold">Online Orders Are Open: </span>
                You can still place your orders online. All orders will be accepted, reserved, and prioritized for fulfillment and dispatch promptly when we reopen on{' '}
                <span className="font-extrabold underline">{reopenDateFormatted}</span>.
              </div>
            </div>
          )}

          {/* Quick Help Contacts */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
            <span className="font-semibold text-slate-500">Need urgent uniform assistance?</span>
            <a
              href="tel:9888388170"
              className="inline-flex items-center gap-1 text-[#881337] font-bold hover:underline"
            >
              <Phone size={12} />
              <span>Call Helpline: 9888388170</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
            <button
              onClick={acknowledgePopup}
              type="button"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors text-center cursor-pointer"
            >
              Got It, Continue Browsing
            </button>

            <Link
              href="/#featured"
              onClick={acknowledgePopup}
              className="flex-1 py-3 px-4 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-[#FEF08A] font-extrabold text-xs sm:text-sm transition-colors text-center shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag size={15} />
              <span>Shop Uniforms Now</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
