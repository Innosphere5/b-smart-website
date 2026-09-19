"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Badge from "@/components/Badge";
import GarmentThumb from "@/components/GarmentThumb";

import { cleanProductImageUrl } from "@/lib/api";

// Helper to remove boy/girl uniform tag from the product
const isBoyGirlUniformTag = (cat) => {
  if (!cat) return false;
  const lower = cat.toLowerCase().trim();
  return lower.includes("boy") || lower.includes("girl");
};

export default function ProductCard({ item }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const rawUri = item.imageSrc || item.images?.[0];
  const imageUri = cleanProductImageUrl(rawUri);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#FCD34D] bg-white p-3 sm:p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#9F1239] hover:shadow-2xl">
      <div>
        {/* Top Institutional Header — Clean & Unobtrusive (doesn't cover the product) */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[11px] font-black text-[#881337] truncate max-w-[70%] bg-[#FEF2F2] border border-[#FECDD3] px-2 py-0.5 rounded-lg shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9F1239] shrink-0" />
            <span className="truncate">{item.school}</span>
          </span>
          {item.applicableClass && (
            <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#7F1D1D] bg-[#FEF9C3] px-2 py-0.5 rounded-md border border-[#FDE047] shrink-0 shadow-2xs">
              {item.applicableClass}
            </span>
          )}
        </div>

        <Link href={`/product/${item.id}`} className="block focus:outline-none">
          <div
            className="relative overflow-hidden rounded-xl aspect-square flex items-center justify-center p-3 sm:p-5 border border-slate-200/70 shadow-[inset_0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-300 group-hover:border-[#9F1239]/40"
            style={{
              background: "radial-gradient(circle at 50% 32%, #FFFFFF 0%, #F8FAFC 55%, #EEF2F6 100%)",
            }}
          >
            {/* Shimmer Placeholder while image loads */}
            {!imageLoaded && !imageError && imageUri && (
              <div className="shimmer-box absolute inset-0 rounded-xl">
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
                className={`h-full w-full object-contain transition-all duration-500 ease-out group-hover:scale-105 ${
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  filter: "drop-shadow(0 10px 18px rgba(15, 23, 42, 0.08)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.04)) contrast(1.03) brightness(1.02)",
                }}
              />
            ) : (
              <GarmentThumb
                tone={item.tone}
                imageSrc={imageUri}
                className="h-40 sm:h-56 w-full md:h-64 object-contain rounded-xl"
                label={item.name}
              />
            )}
          </div>
        </Link>

        <div className="mt-2.5 sm:mt-4">
          {item.category && !isBoyGirlUniformTag(item.category) && (
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
                  : (item.stockQuantity !== undefined && item.stockQuantity <= 2) || item.stock === "low"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-[#7F1D1D]">
              {item.stockQuantity === 0 || item.inStock === false
                ? "Out of Stock"
                : (item.stockQuantity !== undefined && item.stockQuantity <= 2) || item.stock === "low"
                ? `Low Stock (${item.stockQuantity ?? 2} left)`
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
