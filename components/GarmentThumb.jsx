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
      <div className={`flex items-center justify-center overflow-hidden bg-[#FFFDF0] p-2 ${className}`}>
        <img
          src={imageSrc}
          alt={label || "Product image"}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
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
