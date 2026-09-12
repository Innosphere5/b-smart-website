"use client";

import { Shirt } from "lucide-react";

export function SingleProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#FCD34D]/60 bg-white p-2.5 sm:p-4 shadow-sm animate-pulse">
      <div>
        {/* Image Frame with Shimmer */}
        <div className="shimmer-box relative overflow-hidden rounded-lg sm:rounded-xl aspect-square flex items-center justify-center border border-[#FDE047]/60 p-2">
          <div className="shimmer-effect" />
          {/* Subtle Silhouette icon */}
          <Shirt className="h-14 w-14 sm:h-20 sm:w-20 text-[#FACC15]/30 animate-pulse" />

          {/* Badge Skeleton Top Left */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 items-start">
            <div className="h-4 sm:h-5 w-20 sm:w-24 rounded-full bg-[#FEF08A] shadow-xs" />
            <div className="h-3 sm:h-4 w-12 sm:w-16 rounded-full bg-[#FECDD3] shadow-xs" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mt-3 sm:mt-4 space-y-2">
          {/* Category Pill */}
          <div className="h-3 w-16 sm:w-20 rounded-md bg-[#FEF08A]/70" />

          {/* Title Lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-4 sm:h-4.5 w-full rounded-md bg-gray-200" />
            <div className="h-4 sm:h-4.5 w-3/4 rounded-md bg-gray-200" />
          </div>

          {/* Price & Size row */}
          <div className="mt-3 flex items-center justify-between pt-1">
            <div className="h-6 sm:h-7 w-16 sm:w-20 rounded-lg bg-[#FECDD3]/80" />
            <div className="hidden sm:block h-5 w-20 rounded-md bg-[#FEF08A]" />
          </div>

          {/* Stock status indicator */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-3.5 w-24 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="mt-3 sm:mt-4 h-9 sm:h-11 w-full rounded-lg sm:rounded-xl bg-[#FDE047]/70" />
    </div>
  );
}

export default function ProductSkeletonGrid({ count = 8 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      aria-label="Loading products"
    >
      {items.map((key) => (
        <SingleProductCardSkeleton key={key} />
      ))}
    </div>
  );
}
