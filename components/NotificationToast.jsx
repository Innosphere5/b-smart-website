"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/lib/NotificationContext';
import {
  BellRing,
  CheckCircle2,
  Clock,
  X,
  Truck,
  ArrowRight,
  AlertCircle,
  PackageCheck
} from 'lucide-react';

export default function NotificationToast() {
  const { activeToast, dismissToast } = useNotifications();

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  const isAccepted = activeToast.type === 'order_accepted';
  const isDeclined = activeToast.type === 'order_declined';
  const isCompleted = activeToast.type === 'order_completed';
  const isCreated = activeToast.type === 'order_created';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short shadow-2xl">
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-4 transition-all ${
          isAccepted
            ? 'border-blue-400 bg-white text-blue-950 ring-4 ring-blue-100'
            : isDeclined
            ? 'border-red-400 bg-white text-red-950 ring-4 ring-red-100'
            : isCompleted
            ? 'border-emerald-400 bg-white text-emerald-950 ring-4 ring-emerald-100'
            : 'border-[#FCD34D] bg-white text-[#7F1D1D] ring-4 ring-[#FEFCE8]'
        }`}
      >
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div className={`h-full animate-shrink-width ${
            isAccepted ? 'bg-blue-600' : isCompleted ? 'bg-emerald-600' : isDeclined ? 'bg-red-600' : 'bg-[#9F1239]'
          }`} />
        </div>

        <div className="flex items-start gap-3.5 pt-1">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-sm ${
              isAccepted
                ? 'bg-blue-600 text-white'
                : isDeclined
                ? 'bg-red-600 text-white'
                : isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FACC15] text-[#7F1D1D]'
            }`}
          >
            {isAccepted && <Truck size={20} />}
            {isDeclined && <AlertCircle size={20} />}
            {isCompleted && <PackageCheck size={20} />}
            {isCreated && <BellRing size={20} />}
            {!isAccepted && !isDeclined && !isCompleted && !isCreated && <CheckCircle2 size={20} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Live Store Notification
              </span>
              <button
                onClick={dismissToast}
                className="text-gray-400 hover:text-gray-700 p-0.5 rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>

            <h4 className="mt-0.5 text-sm font-black tracking-tight text-[#7F1D1D]">
              {activeToast.title}
            </h4>

            <p className="mt-1 text-xs font-semibold text-gray-700 leading-snug">
              {activeToast.message}
            </p>

            {activeToast.orderId && (
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/orders`}
                  onClick={dismissToast}
                  className="inline-flex items-center gap-1 text-xs font-black text-[#9F1239] hover:underline"
                >
                  View in My Orders <ArrowRight size={13} />
                </Link>
                {isAccepted && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    <Clock size={11} /> Live Tracking Active
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
