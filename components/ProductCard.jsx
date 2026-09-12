"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Badge from "@/components/Badge";
import GarmentThumb from "@/components/GarmentThumb";

export default function ProductCard({ item }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUri = item.imageSrc || item.images?.[0];

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#FCD34D] bg-white p-2.5 sm:p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#9F1239] hover:shadow-2xl">
      <div>
        <Link href={`/product/${item.id}`} className="block focus:outline-none">
          <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-[#FFFDF0] aspect-square flex items-center justify-center border border-[#FDE047] p-1 sm:p-2">
            {/* Shimmer Placeholder while image loads */}
            {!imageLoaded && !imageError && imageUri && (
              <div className="shimmer-box absolute inset-0 rounded-lg sm:rounded-xl">
                <div className="shimmer-effect" />
              </div>
            )}

            {imageUri && !imageError ? (
              <img
                src={imageUri}
                alt={item.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`h-full w-full object-contain rounded-lg sm:rounded-xl transition-all duration-500 ease-out group-hover:scale-105 filter contrast-105 ${
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ mixBlendMode: "multiply" }}
              />
            ) : (
              <GarmentThumb
                tone={item.tone}
                imageSrc={imageUri}
                className="h-40 sm:h-56 w-full md:h-64 object-contain rounded-xl"
                label={item.name}
              />
            )}

            {/* School & Class Badges with Floating Soft Shadow */}
            <div className="absolute left-1.5 sm:left-2.5 top-1.5 sm:top-2.5 flex flex-col gap-0.5 sm:gap-1 items-start max-w-[80%] z-10 pointer-events-none">
              <Badge variant="school">{item.school}</Badge>
              {item.applicableClass && (
                <span className="rounded-full bg-[#7F1D1D] px-2 py-0.5 text-[8px] sm:text-[10px] font-black text-white shadow-md tracking-tight">
                  {item.applicableClass}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-2.5 sm:mt-4">
          {item.category && (
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#9F1239] block mb-0.5 sm:mb-1">
              {item.category}
            </span>
          )}
          <Link href={`/product/${item.id}`} className="focus:outline-none">
            <h3 className="text-xs sm:text-sm font-black text-[#450A0A] line-clamp-2 transition-colors duration-200 group-hover:text-[#9F1239] min-h-[32px] sm:min-h-[40px] leading-snug">
              {item.name}
            </h3>
          </Link>

          {/* Price & Size */}
          <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
            <span className="text-lg sm:text-2xl font-black text-[#9F1239] tracking-tight">
              ₹{item.basePrice}
            </span>
            {item.sizesText && (
              <span className="hidden sm:inline rounded-lg border border-[#FCD34D] bg-[#FEFCE8] px-2.5 py-1 text-xs font-extrabold text-[#7F1D1D] shadow-2xs">
                {item.sizesText}
              </span>
            )}
          </div>

          {/* Stock status badge with pulse */}
          <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-extrabold text-gray-700 bg-[#FFFDF0] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-[#FDE047] w-fit">
            <span
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                item.stockQuantity === 0 || item.inStock === false
                  ? "bg-red-500"
                  : (item.stockQuantity ?? 50) < 15 || item.stock === "low"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[#7F1D1D]">
              {item.stockQuantity === 0 || item.inStock === false
                ? "Out of Stock"
                : (item.stockQuantity ?? 50) < 15 || item.stock === "low"
                ? `Low Stock (${item.stockQuantity ?? 8})`
                : `In Stock`}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <Link
        href={`/product/${item.id}`}
        className="mt-2.5 sm:mt-4 flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#FACC15] py-2 sm:py-3 text-xs sm:text-sm font-black text-[#7F1D1D] shadow-md transition-all duration-200 hover:bg-[#EAB308] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none"
      >
        <ShoppingCart size={14} className="transition-transform duration-200 group-hover:scale-110" />
        Add to Cart
      </Link>
    </div>
  );
}
