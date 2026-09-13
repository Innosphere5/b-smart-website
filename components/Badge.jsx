const VARIANTS = {
  school: "border border-[#FCD34D] bg-[#FEFCE8] text-[#9F1239] font-extrabold shadow-2xs",
  lowStock: "bg-[#DC2626] text-white font-bold",
  inStock: "border border-[#FCD34D] bg-[#FEFCE8] text-[#881337] font-bold",
  delivered: "bg-emerald-100 text-emerald-800 font-bold",
  processing: "bg-[#FACC15]/30 text-[#881337] font-bold",
};

export default function Badge({ variant = "school", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 sm:px-2.5 py-0.5 text-[8px] sm:text-[10.5px] font-bold sm:font-extrabold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
