import Link from "next/link";
import Image from "next/image";
import { User, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { label: "Schools", href: "/#schools" },
  { label: "Boys", href: "/" },
  { label: "Girls", href: "/" },
  { label: "Accessories", href: "/" },
  { label: "Offers", href: "/" },
];

export default function StoreHeader({ cartLabel = "Cart" }) {
  return (
    <header className="w-full bg-[#881337] text-white shadow-md border-b-2 border-[#FACC15]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-6 py-3.5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="overflow-hidden rounded-xl bg-[#FACC15] p-1 shadow-md border-2 border-[#FACC15] group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/logo.jpg"
              alt="B'Smart Logo"
              width={100}
              height={36}
              className="h-9 w-auto object-contain rounded-lg"
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white uppercase">
            B&apos;Smart <span className="text-[#FACC15]">®</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/90 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button className="rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors">
            School Selector
          </button>
          <Link href="/account" aria-label="Account" className="text-white/90 hover:text-accent transition-colors">
            <User size={18} />
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-accent transition-colors underline decoration-accent underline-offset-4"
          >
            <ShoppingBag size={16} />
            {cartLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
