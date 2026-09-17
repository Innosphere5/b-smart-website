"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search, User, ShoppingCart, Sparkles,
  Menu, X, Home, ShoppingBag, Package, LayoutGrid, ChevronDown, LogOut, Phone
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/lib/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop Catalog", href: "/#featured" },
  { label: "Schools", href: "/#schools" },
  { label: "Categories", href: "/#featured" },
  { label: "My Orders", href: "/orders" },
  { label: "Cart", href: "/cart" },
];

const BOTTOM_NAV = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Catalog", href: "/#featured", Icon: LayoutGrid },
  { label: "Cart", href: "/cart", Icon: ShoppingCart, showBadge: true },
  { label: "Orders", href: "/orders", Icon: Package },
  { label: "Account", href: "/account", Icon: User },
];

export default function Header({ activeHref = "/", cartCount: propCartCount }) {
  const { cartCount: contextCartCount } = useCart();
  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Track hash changes for section-anchored tabs like Catalog (#featured)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentHash(window.location.hash || "");
      const handleHash = () => setCurrentHash(window.location.hash || "");
      window.addEventListener("hashchange", handleHash);
      return () => window.removeEventListener("hashchange", handleHash);
    }
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header className="w-full bg-[#881337] text-white shadow-lg border-b-4 border-[#FACC15]">
        {/* Top Notice Banner with Click-to-Call Helpline */}
        <div className="bg-[#9F1239] text-[#FEF08A] px-3 py-1.5 text-center text-[10px] sm:text-xs font-black flex flex-wrap items-center justify-center sm:justify-between border-b border-[#BE123C] max-w-7xl mx-auto gap-2">
          <span className="flex items-center gap-1 truncate">
            <Sparkles size={12} className="text-[#FACC15] shrink-0" />
            ★ Best Quality SCHOOL UNIFORMS. FAST DOORSTEP DELIVERY.
          </span>
          <a
            href="tel:9888388170"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#7F1D1D] hover:bg-[#FACC15] text-[#FACC15] hover:text-[#7F1D1D] px-2.5 py-0.5 border border-[#FACC15]/40 transition-all font-black text-[10px] sm:text-[11px] shadow-xs"
            title="Call Store Helpline"
          >
            <Phone size={11} className="shrink-0" />
            <span>Call Helpline: 9888388170</span>
          </a>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3 sm:gap-6 px-3 sm:px-6 py-2.5 md:py-3.5 md:px-10">
          {/* Hamburger Button — Mobile Only */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-[#FACC15] p-0.5 sm:p-1 shadow-md border-2 border-[#FACC15] group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo.jpg"
                alt="B'Smart Logo"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto max-h-11 object-contain rounded-md sm:rounded-lg"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-white uppercase leading-tight">
                B&apos;SMART <span className="text-[#FACC15]">DRESSES</span>
              </span>
              <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-extrabold tracking-wider text-[#FACC15] uppercase mt-0.5 font-mono leading-none block">
                GSTIN: 03ANXPG2252L1ZS
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden flex-1 items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3.5 py-2 text-sm text-white placeholder:text-white/70 md:flex md:max-w-xs focus-within:bg-white/25">
            <Search size={16} className="shrink-0 text-[#FACC15]" />
            <span className="text-white/80 font-medium text-xs">Search uniform, school, class...</span>
          </div>

          {/* Desktop Nav */}
          <nav className="ml-auto hidden items-center gap-6 text-sm font-bold text-white/90 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.href === activeHref
                    ? "text-[#FACC15] font-black underline decoration-[#FACC15] decoration-2 underline-offset-8"
                    : "hover:text-[#FACC15] transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5 md:gap-4 md:ml-0">
            <NotificationCenter />

            {/* Desktop Account / Sign In */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 transition text-xs font-black text-white border border-white/20 cursor-pointer"
                  aria-label="User menu"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={22}
                      height={22}
                      className="rounded-full object-cover border border-[#FACC15]"
                    />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[#881337] text-[10px] font-black">
                      {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[85px] truncate text-xs font-bold text-white">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown size={14} className="text-[#FACC15]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border-2 border-[#FCD34D] bg-white p-2 text-gray-800 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-black text-[#881337] truncate">
                          {user.displayName || "Parent Account"}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold hover:bg-[#FEFCE8] text-gray-700 hover:text-[#881337] transition"
                      >
                        <User size={15} /> My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold hover:bg-[#FEFCE8] text-gray-700 hover:text-[#881337] transition"
                      >
                        <Package size={15} /> My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Sign In"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-black text-white transition cursor-pointer"
              >
                <User size={15} className="text-[#FACC15]" />
                <span>Sign In</span>
              </Link>
            )}
            <Link href="/cart" aria-label="Cart" className="relative text-white/90 hover:text-[#FACC15] transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FACC15] text-[10px] font-black text-[#881337] shadow-md border-2 border-[#881337]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ========== Mobile Drawer Overlay ========== */}
      {drawerOpen && (
        <div className="mobile-drawer-backdrop md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="overflow-hidden rounded-lg bg-[#FACC15] p-0.5 shadow-sm border border-[#FACC15] shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="B'Smart Logo"
                    width={80}
                    height={30}
                    className="h-7 w-auto object-contain rounded"
                  />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-tight">
                  B&apos;Smart <span className="text-[#FACC15]">Dresses</span>
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2.5 text-sm text-white">
                <Search size={16} className="shrink-0 text-[#FACC15]" />
                <span className="text-white/70 font-medium text-xs">Search uniform, school...</span>
              </div>
            </div>

            {/* Mobile User Status */}
            <div className="px-4 py-2 border-b border-white/15">
              {user ? (
                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-2.5">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="User"
                        width={28}
                        height={28}
                        className="rounded-full object-cover border border-[#FACC15]"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FACC15] text-[#881337] text-xs font-black">
                        {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">
                        {user.displayName || "Customer"}
                      </span>
                      <span className="text-[10px] text-white/60 truncate max-w-[130px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      logout();
                    }}
                    className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#FACC15] text-[#881337] text-xs font-black shadow-sm"
                >
                  <User size={15} />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>

            {/* Nav Links */}
            <nav className="px-3 py-2 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    link.href === activeHref
                      ? "bg-[#FACC15] text-[#7F1D1D] font-black shadow-sm"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label === "Cart" && (
                    <span className="relative">
                      <ShoppingCart size={16} />
                      {cartCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-black text-[#881337]">
                          {cartCount}
                        </span>
                      )}
                    </span>
                  )}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/15 bg-[#7F1D1D]">
              <a
                href="tel:9888388170"
                className="flex items-center justify-center gap-2 w-full py-2.5 mb-2.5 rounded-xl bg-[#FACC15] text-[#881337] font-black text-xs shadow-sm hover:bg-[#FDE047] transition"
              >
                <Phone size={14} />
                <span>Call Store Helpline: 9888388170</span>
              </a>
              <p className="text-[10px] font-bold text-yellow-100/80 text-center">
                GSTIN: 03ANXPG2252L1ZS
              </p>
              <p className="text-[10px] font-semibold text-yellow-100/60 text-center mt-0.5">
                © 2026 B&apos;Smart Dresses
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== Bottom Navigation Bar — Mobile Only ========== */}
      <div className="bottom-nav md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {BOTTOM_NAV.map(({ label, href, Icon, showBadge }) => {
            const isHome = href === "/" && pathname === "/" && (!currentHash || currentHash === "#");
            const isCatalog = href === "/#featured" && pathname === "/" && currentHash === "#featured";
            const isOtherPage = href !== "/" && href !== "/#featured" && pathname?.startsWith(href);
            const isActive = isHome || isCatalog || isOtherPage;

            return (
              <Link
                key={label}
                href={href}
                onClick={() => {
                  if (href === "/") {
                    setCurrentHash("");
                    if (pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  } else if (href === "/#featured") {
                    setCurrentHash("#featured");
                  }
                }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[52px] ${
                  isActive
                    ? "text-[#9F1239]"
                    : "text-gray-500 hover:text-[#881337]"
                }`}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9F1239] text-[9px] font-black text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] ${isActive ? "font-black" : "font-semibold"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
