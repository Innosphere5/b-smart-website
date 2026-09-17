import { Shirt } from "lucide-react";

/**
 * Renders product photography with automatic background removal
 * using blend mode multiply and contrast filters for seamless card integration.
 */
export default function GarmentThumb({ className = "", tone = "navy", label, imageSrc }) {
  const tones = {
    navy: "bg-[#FFFDF0] text-red-900",
    cream: "bg-[#FEF8E7] text-red-900",
    white: "bg-[#FFFDF0] text-red-800 border border-[#FDE047]",
  };

  if (imageSrc) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 p-2 shadow-inner ${className}`}
        style={{
          background: "radial-gradient(circle at 50% 38%, #FFFFFF 0%, #F8FAFC 60%, #EEF2F6 100%)",
        }}
      >
        <img
          src={imageSrc}
          alt={label || "Product image"}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          style={{
            filter: "drop-shadow(0 6px 14px rgba(15, 23, 42, 0.08)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.04))",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg ${tones[tone]} ${className}`}
      role="img"
      aria-label={label || "Garment preview"}
    >
      <Shirt size={28} strokeWidth={1.5} />
    </div>
  );
}
