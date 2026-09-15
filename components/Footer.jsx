import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, RotateCcw, Truck, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t-4 border-[#FACC15] bg-[#881337] text-white mobile-bottom-pad">
      {/* Top Banner Accent in Footer */}
      <div className="bg-[#7F1D1D] px-4 py-2.5 sm:py-3 border-b border-[#BE123C]/50 text-center text-[10px] sm:text-xs font-bold text-[#FEF08A]">
        ★ Best Quality School Uniforms Provider &bull; Fast Doorstep Delivery
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {/* Column 1: Brand Logo & Registration Details */}
          <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-xl bg-[#FACC15] p-1 shadow-md border-2 border-[#FACC15]">
                <Image
                  src="/logo.jpg"
                  alt="B'Smart Logo"
                  width={110}
                  height={40}
                  className="h-9 sm:h-10 w-auto object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase leading-none">
                  B&apos;SMART <span className="text-[#FACC15]">DRESSES</span>
                </p>

                <span className="block text-[10px] font-extrabold tracking-wider text-[#FACC15] uppercase mt-0.5 font-mono">
                  GSTIN: 03ANXPG2252L1ZS
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-xs w-full">
              <p className="text-yellow-100/90 leading-relaxed font-semibold">
                Best quality school uniforms, comfortable fabrics , accessories and fast doorstep delivery.
              </p>
            </div>

          </div>

          {/* Column 2: Contact Information */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/20 pb-3">
              <Phone className="text-[#FACC15]" size={18} />
              <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">Contact Us</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-bold text-yellow-200 uppercase tracking-wider block mb-1">
                  Mobile / Helpline
                </span>
                <a
                  href="tel:9888388170"
                  className="inline-flex items-center gap-2 text-lg sm:text-xl font-black text-[#FACC15] hover:text-white transition-colors bg-[#7F1D1D] px-3.5 py-1.5 rounded-xl border border-[#FACC15]/40 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Phone size={16} /> M: 9888388170
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-white/90 mt-1">
                <Truck size={14} className="text-[#FACC15] shrink-0" />
                <span>Fast Doorstep Delivery (Minimum order value Rs.500) </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Clock size={14} className="text-[#FACC15] shrink-0" />
                <span>Store Hours: Mon - Sat (10 AM - 8 PM)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Return Policy & Store Address */}
          <div className="flex flex-col gap-4">
            {/* Return / Exchange Policy Notice */}
            <div className="rounded-2xl border-2 border-[#FACC15] bg-[#7F1D1D] p-4 shadow-md">
              <div className="flex items-center gap-2">
                <RotateCcw className="text-[#FACC15] shrink-0" size={18} />
                <h3 className="text-sm sm:text-base font-black text-white uppercase">Terms &amp; Conditions</h3>
              </div>
              <ol className="mt-2 text-[10px] font-semibold text-yellow-100 leading-snug list-none space-y-1">
                <li>1. Any return or exchange of the product can be done within 7 days of purchase at our store.</li>
                <li>2. Original receipt or invoice is required.</li>
                <li>3. Clothes should be unworn, unwashed and with all original tags unbroken should be there in same condition.</li>
                <li>4. No Guarantee No Claim on any product.</li>
                <li>5. Subject to Bathinda Jurisdiction only.</li>
              </ol>
            </div>

            {/* Store Address */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1.5 font-black text-[#FACC15] uppercase tracking-wide">
                <MapPin size={14} /> Full Store Address
              </div>
              <p className="font-extrabold text-white leading-relaxed pl-5">
                #MCB-Z304654, Dr. Mela Ram Hospital Road, Amrik Singh Road, Bathinda. (PB)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 sm:mt-10 border-t border-white/20 pt-4 sm:pt-6 text-center text-[11px] sm:text-xs font-bold text-yellow-100/70 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p>© 2026 B&apos;Smart Dresses. All Rights Reserved.</p>
          <p className="text-[10px] sm:text-[11px] text-white/90">
            GSTIN: <span className="text-[#FACC15]">03ANXPG2252L1ZS</span> | UID: <span className="text-[#FACC15]">MCB-Z304654</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
