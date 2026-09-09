const VARIANTS = {
  school: "border border-[#FCD34D] bg-[#FEFCE8] text-[#9F1239] font-extrabold shadow-2xs",
  lowStock: "bg-[#DC2626] text-white font-bold",
  inStock: "border border-[#FCD34D] bg-[#FEFCE8] text-[#881337] font-bold",
  delivered: "bg-emerald-100 text-emerald-800 font-bold",
  processing: "bg-[#FACC15]/30 text-[#881337] font-bold",
};

export default function Badge({ variant = "school", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
