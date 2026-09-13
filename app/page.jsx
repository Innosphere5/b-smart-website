"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductSkeletonGrid from "@/components/ProductSkeleton";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import {
  GraduationCap,
  ShieldCheck,
  Landmark,
  BookOpen,
  ArrowRight,
  Ruler,
  Truck,
  ShoppingCart,
  Star,
  Award,
  Sparkles,
  Layers,
} from "lucide-react";
import { getLiveProducts, getCachedProducts } from "@/lib/api";

const SCHOOLS = [
  { name: "DAV Public School", tag: "Boys & Girls", Icon: GraduationCap },
  { name: "St. Mary's", tag: "Primary & Secondary", Icon: ShieldCheck },
  { name: "Delhi Public School", tag: "All Grades", Icon: Landmark },
  { name: "Kendriya Vidyalaya", tag: "Uniforms & Accessories", Icon: BookOpen, highlighted: true },
];

export default function HomePage() {
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [isLoading, setIsLoading] = useState(() => !getCachedProducts());
  const [isLive, setIsLive] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const data = await getLiveProducts();
        if (isMounted && Array.isArray(data)) {
          setProducts(data);
          setIsLive(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCatalog();
    const interval = setInterval(loadCatalog, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Garment category tabs instead of generic Boys/Girls Uniform
  const categories = useMemo(() => {
    const baseTabs = ["All", "Blazer", "Shirt", "Pant", "Sweater"];
    // Collect any other unique categories from loaded products, excluding boy/girl uniform
    const extra = new Set();
    products.forEach((p) => {
      if (p.category) {
        const lower = p.category.toLowerCase().trim();
        if (
          !lower.includes("boy") &&
          !lower.includes("girl") &&
          !baseTabs.some((t) => lower.includes(t.toLowerCase()))
        ) {
          extra.add(p.category);
        }
      }
    });
    return [...baseTabs, ...Array.from(extra)];
  }, [products]);

  // Filter products by school and category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSchool =
        selectedSchool === "All" ||
        item.school?.toLowerCase().includes(selectedSchool.toLowerCase()) ||
        item.school === "General School";

      if (!matchSchool) return false;
      if (selectedCategory === "All") return true;

      const cat = (item.category || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      const sel = selectedCategory.toLowerCase();

      if (sel.includes("blazer") || sel.includes("blezzer") || sel.includes("coat")) {
        return (
          cat.includes("blazer") ||
          cat.includes("court") ||
          cat.includes("coat") ||
          name.includes("court") ||
          name.includes("blazer") ||
          name.includes("coat")
        );
      }
      if (sel.includes("shirt")) {
        return cat.includes("shirt") || name.includes("shirt");
      }
      if (sel.includes("pant")) {
        return (
          cat.includes("pant") ||
          cat.includes("trouser") ||
          name.includes("pant") ||
          name.includes("trouser")
        );
      }
      if (sel.includes("sweater")) {
        return (
          cat.includes("sweater") ||
          cat.includes("cardigan") ||
          name.includes("sweater")
        );
      }
      if (sel.includes("accessories") || sel.includes("tie")) {
        return (
          cat.includes("accessories") ||
          cat.includes("tie") ||
          cat.includes("belt") ||
          name.includes("tie") ||
          name.includes("belt")
        );
      }

      return cat === sel || cat.includes(sel) || name.includes(sel);
    });
  }, [products, selectedSchool, selectedCategory]);

  const handleSchoolCardClick = (schoolName) => {
    setSelectedSchool(selectedSchool === schoolName ? "All" : schoolName);
    const target = document.getElementById("featured");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad relative selection:bg-[#FACC15]/60 selection:text-[#450A0A]">
      {/* Top Luxury Scroll Progress Indicator */}
      <ScrollProgressBar />

      <Header activeHref="/" />

      {/* Hero Section with Parallax Depth and Glow */}
      <section className="w-full bg-[#FEF8E7] py-4 sm:py-6 md:py-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#7F1D1D] via-[#9F1239] to-[#BE123C] p-4 sm:p-8 md:p-12 shadow-2xl border-2 sm:border-4 border-[#FACC15] animate-glow">
            {/* Soft decorative golden blur ambient circles */}
            <div className="absolute -right-20 -top-20 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-[#FACC15]/25 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-[#FACC15]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid gap-6 sm:gap-8 md:grid-cols-2 md:items-center">
              <ScrollReveal direction="up" delay={50}>
                <div>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2.5 rounded-full bg-gradient-to-r from-[#FACC15] via-[#FDE047] to-[#FACC15] px-2.5 sm:px-4 py-1 sm:py-1.5 text-[9.5px] sm:text-xs font-black uppercase tracking-wider text-[#7F1D1D] shadow-[0_2px_12px_rgba(250,204,21,0.3)] border border-yellow-200/80 transition-all duration-200 hover:scale-105 max-w-full">
                    <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#7F1D1D] text-[#FACC15] shrink-0 shadow-xs">
                      <Award size={10} className="sm:w-3 sm:h-3" />
                    </span>
                    <span className="font-black whitespace-nowrap">★ Premium Quality Uniforms</span>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#7F1D1D]/15 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] text-[#7F1D1D] font-extrabold shrink-0 border border-[#7F1D1D]/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Live Store
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white uppercase tracking-tight drop-shadow-md">
                    B&apos;SMART <span className="text-[#FACC15]">DRESSES</span>
                  </h1>

                  {/* Promo Badge Box */}
                  <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border-2 border-[#FACC15] bg-white/10 backdrop-blur-md p-3 sm:p-4 shadow-lg text-white transition-all duration-300 hover:bg-white/15">
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#FACC15] text-[#7F1D1D] font-black text-xl shadow-md shrink-0">
                          <Truck size={22} />
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-black text-[#FACC15] uppercase tracking-wide">
                            Free Home Delivery
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-yellow-100">
                            Min Order:{" "}
                            <span className="text-white font-black underline decoration-[#FACC15]">
                              Rs. 500/-
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#FACC15] text-[#7F1D1D] text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3 py-0.5 sm:py-1 uppercase shadow-sm">
                        Fast Dispatch
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 sm:mt-4 max-w-md text-[10px] sm:text-xs md:text-sm leading-relaxed text-yellow-100 font-semibold flex items-start gap-1.5">
                    <span>
                      📍 <strong className="text-white">Store:-</strong> #MCB-Z304654, Dr. Mela Ram Hospital Road, Amrik Singh Road, Bathinda. (PB)
                    </span>
                  </p>

                  <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <a
                      href="#featured"
                      className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#FACC15] px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-black text-[#7F1D1D] shadow-lg transition-all duration-300 hover:bg-[#EAB308] hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <ShoppingCart size={18} /> Shop Collection
                    </a>

                    <a
                      href="#schools"
                      className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-[#FACC15] bg-white/10 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 active:scale-95"
                    >
                      Find Your School
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              {/* Hero Image Showcase with Floating Elements */}
              <ScrollReveal direction="up" delay={150}>
                <div className="relative flex items-center justify-center min-h-[200px] sm:min-h-[320px] md:min-h-[420px]">
                  <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-[#FACC15] bg-[#FEF08A] p-2 sm:p-3.5 shadow-2xl flex items-center justify-center ring-2 sm:ring-4 ring-[#FACC15]/30">
                    <img
                      src="/hero-kids.png"
                      alt="B'Smart Dresses - Students wearing school uniforms"
                      loading="eager"
                      className="h-full max-h-[250px] sm:max-h-[350px] md:max-h-[390px] w-full object-contain filter drop-shadow-[0_12px_24px_rgba(136,19,55,0.25)] transition-transform duration-500 ease-out hover:scale-105"
                    />
                  </div>
                  <div className="absolute -bottom-3 sm:-bottom-4 right-2 sm:right-4 rounded-xl sm:rounded-2xl bg-white px-3 sm:px-4 py-1.5 sm:py-2.5 shadow-2xl border-2 border-[#7F1D1D] flex items-center gap-1.5 sm:gap-2 z-10 animate-float">
                    <Star className="fill-[#9F1239] text-[#9F1239]" size={16} />
                    <span className="text-[10px] sm:text-xs font-black text-[#7F1D1D]">
                      100% Quality Fabric
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by School Section */}
      <section id="schools" className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FFFDF0] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <ScrollReveal direction="up" delay={50}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-6 sm:h-8 w-2 rounded-full bg-[#9F1239]" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#7F1D1D]">
                    Shop by School
                  </h2>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-700">
                  Select your institution to view compliant uniforms
                </p>
              </div>

              {selectedSchool !== "All" && (
                <button
                  onClick={() => setSelectedSchool("All")}
                  className="text-xs font-black text-[#9F1239] hover:underline self-start sm:self-auto bg-[#FEF08A] px-3 py-1 rounded-full border border-[#FCD34D]"
                >
                  Clear filter (Showing {selectedSchool}) ✕
                </button>
              )}
            </div>
          </ScrollReveal>

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {SCHOOLS.map(({ name, tag, Icon, highlighted }, idx) => {
              const isSelected = selectedSchool === name;

              return (
                <ScrollReveal key={name} direction="up" delay={idx * 60}>
                  <button
                    onClick={() => handleSchoolCardClick(name)}
                    className={`w-full flex flex-col items-center gap-2 sm:gap-3.5 rounded-xl sm:rounded-2xl border-2 p-3 sm:p-6 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl active:scale-95 ${isSelected
                      ? "border-[#9F1239] ring-4 ring-[#9F1239]/20 bg-[#FFF1F2]"
                      : highlighted
                        ? "border-[#9F1239] bg-[#FFF5F5] hover:border-[#7F1D1D]"
                        : "border-[#FCD34D] bg-white hover:border-[#9F1239]"
                      }`}
                  >
                    <span
                      className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl shadow-inner border transition-transform duration-300 hover:scale-110 ${isSelected
                        ? "bg-[#9F1239] text-white border-[#7F1D1D]"
                        : "bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]"
                        }`}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="text-xs sm:text-base font-black text-[#7F1D1D] leading-tight">
                      {name}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#9F1239] bg-[#FEFCE8] px-2 py-0.5 rounded-full border border-[#FCD34D]">
                      {tag}
                    </span>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Uniforms Catalog Section */}
      <section id="featured" className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FEF8E7] py-8 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <ScrollReveal direction="up" delay={50}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-6 sm:h-8 w-2 rounded-full bg-[#FACC15]" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#7F1D1D]">
                    School Uniforms Catalog
                  </h2>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-700">
                  Strictly compliant school uniforms, blazers, sweaters &amp; accessories
                </p>
              </div>

              {/* Quick Filter Tabs for Category */}
              {categories.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all duration-200 active:scale-95 ${selectedCategory === cat
                        ? "bg-[#9F1239] text-white shadow-md border-2 border-[#7F1D1D]"
                        : "bg-white text-gray-700 hover:bg-[#FEF08A] border border-[#FCD34D]"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Active Filter Indicators */}
          {(selectedSchool !== "All" || selectedCategory !== "All") && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-600">Active Filters:</span>
              {selectedSchool !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#9F1239] px-2.5 py-1 text-xs font-black text-white shadow-xs">
                  {selectedSchool}
                  <button onClick={() => setSelectedSchool("All")} className="hover:text-[#FACC15]">
                    ✕
                  </button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FACC15] px-2.5 py-1 text-xs font-black text-[#7F1D1D] shadow-xs">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")} className="hover:text-red-800">
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedSchool("All");
                  setSelectedCategory("All");
                }}
                className="text-xs font-black text-[#9F1239] underline ml-1"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Product Grid / Skeleton Loading State */}
          {isLoading ? (
            /* Shimmer Skeleton UI */
            <ProductSkeletonGrid count={8} />
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <ScrollReveal direction="up" delay={50}>
              <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#FCD34D] bg-white p-8 sm:p-12 text-center shadow-md">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#FFFDF0] text-[#9F1239] border-2 border-[#FCD34D] shadow-inner">
                  <ShoppingCart size={32} />
                </div>
                <h3 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-black text-[#7F1D1D]">
                  No Products Found
                </h3>
                <p className="mt-2 max-w-md text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
                  No uniforms match the selected filters. Try clearing the filters or check back shortly.
                </p>
                <button
                  onClick={() => {
                    setSelectedSchool("All");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs font-black text-[#7F1D1D] shadow-md hover:bg-[#EAB308]"
                >
                  Show All Products ({products.length})
                </button>
              </div>
            </ScrollReveal>
          ) : (
            /* Live Loaded Products Grid with Smooth Stagger Entrance */
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((item, idx) => (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  delay={(idx % 4) * 80}
                  className="h-full"
                >
                  <ProductCard item={item} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section with Staggered Cards */}
      <section className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FFFDF0] py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <ScrollReveal direction="up" delay={50}>
            <div className="rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-6 sm:p-10 md:p-14 shadow-xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF08A] px-3 py-1 text-xs font-black text-[#7F1D1D] mb-3">
                <Sparkles size={14} className="text-[#9F1239]" /> Simple &amp; Hassle-Free
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#7F1D1D] tracking-tight">
                How B&apos;Smart Works
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-md mx-auto">
                3 Simple Steps to Get Compliant School Uniforms Delivered to Your Doorstep
              </p>

              <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <ScrollReveal direction="up" delay={80}>
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:bg-[#FEFCE8]/60 hover:-translate-y-1">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15] transition-transform duration-300 hover:scale-110">
                      <GraduationCap size={28} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">
                      1. Select School &amp; Class
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                      Select your school institution and student class group for certified dress code compliance.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={160}>
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:bg-[#FEFCE8]/60 hover:-translate-y-1">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15] transition-transform duration-300 hover:scale-110">
                      <Ruler size={26} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">
                      2. Pick Size &amp; Order
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                      Select your size for perfect fitting and place your order.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={240}>
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:bg-[#FEFCE8]/60 hover:-translate-y-1">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15] transition-transform duration-300 hover:scale-110">
                      <Truck size={26} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">
                      3. Fast Doorstep Delivery
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                      Receive durable, certified school uniforms packaged cleanly and delivered to your home.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      {/* Floating Smooth Scroll Back to Top Button */}
      <BackToTop />
    </main>
  );
}
