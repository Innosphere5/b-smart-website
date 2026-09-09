"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/lib/NotificationContext';
import {
  Bell,
  CheckCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  PackageCheck,
  Radio
} from 'lucide-react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isLiveConnected,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#FCD34D] bg-white text-[#7F1D1D] shadow-xs transition hover:border-[#9F1239] hover:bg-[#FEFCE8]"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-wiggle" : ""} />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#9F1239] px-1 text-[11px] font-black text-white shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {isLiveConnected && (
          <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Real-time Live CDC Connected" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border-2 border-[#FCD34D] bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-[#7F1D1D]">Notifications</h3>
              {isLiveConnected && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-extrabold text-[#9F1239] hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="mt-3 max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold">No notifications yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Order confirmations and live delivery updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isAccepted = notif.type === 'order_accepted';
                const isDeclined = notif.type === 'order_declined';
                const isCompleted = notif.type === 'order_completed';

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`group relative rounded-2xl border p-3 transition cursor-pointer ${
                      notif.read
                        ? 'border-gray-100 bg-gray-50/50 hover:bg-[#FEFCE8]/60 hover:border-[#FCD34D]'
                        : 'border-[#FCD34D] bg-[#FFFDF0] shadow-xs hover:border-[#9F1239]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isAccepted
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : isDeclined
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {isAccepted && <Truck size={15} />}
                        {isDeclined && <AlertCircle size={15} />}
                        {isCompleted && <PackageCheck size={15} />}
                        {!isAccepted && !isDeclined && !isCompleted && <Bell size={15} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${notif.read ? 'font-bold text-gray-700' : 'font-black text-[#7F1D1D]'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] font-medium text-gray-600 leading-snug">
                          {notif.message}
                        </p>

                        {notif.orderId && (
                          <div className="mt-1.5 flex items-center justify-between">
                            <Link
                              href="/orders"
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-[11px] font-black text-[#9F1239] hover:underline"
                            >
                              Track Order <ExternalLink size={11} />
                            </Link>
                            {!notif.read && (
                              <span className="h-2 w-2 rounded-full bg-[#9F1239]" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 border-t border-gray-100 pt-2.5 text-center">
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-black text-[#7F1D1D] hover:text-[#9F1239] hover:underline"
            >
              View Order History &amp; Tracking
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
