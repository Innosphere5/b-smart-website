"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GarmentThumb from "@/components/GarmentThumb";
import Badge from "@/components/Badge";
import { GraduationCap, ShieldCheck, Landmark, BookOpen, ArrowRight, Ruler, Truck, ShoppingCart, Cloud, Star, Sparkles, Award } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { getLiveProducts } from "@/lib/api";

const SCHOOLS = [
  { name: "DAV Public School", tag: "Boys & Girls", Icon: GraduationCap },
  { name: "St. Mary's", tag: "Primary & Secondary", Icon: ShieldCheck },
  { name: "Delhi Public School", tag: "All Grades", Icon: Landmark },
  { name: "Kendriya Vidyalaya", tag: "Uniforms & Accessories", Icon: BookOpen, highlighted: true },
];

export default function HomePage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const data = await getLiveProducts();
      if (Array.isArray(data)) {
        setProducts(data);
        setIsLive(true);
      }
    }
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
      <Header activeHref="/" />

      {/* Hero Section */}
      <section className="w-full bg-[#FEF8E7] py-4 sm:py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#7F1D1D] via-[#9F1239] to-[#BE123C] p-5 sm:p-8 md:p-12 shadow-xl border-2 sm:border-4 border-[#FACC15]">
            {/* Soft decorative golden blur circles */}
            <div className="absolute -right-20 -top-20 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-[#FACC15]/20 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-[#FACC15]/15 blur-3xl" />

            <div className="relative z-10 grid gap-6 sm:gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-full bg-[#FACC15] px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#7F1D1D] shadow-md">
                  <Award size={12} className="text-[#7F1D1D]" />
                  <span>★ Best Quality Uniforms</span>
                  {isLive && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />}
                </div>

                <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white uppercase tracking-tight drop-shadow-sm">
                  B&apos;SMART <span className="text-[#FACC15]">DRESSES</span>
                </h1>


                {/* Promo Badge Box */}
                <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl border-2 border-[#FACC15] bg-white/10 backdrop-blur-md p-3 sm:p-4 shadow-lg text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#FACC15] text-[#7F1D1D] font-black text-xl shadow-md shrink-0">
                        <Truck size={20} />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-black text-[#FACC15] uppercase tracking-wide">
                          Free Home Delivery
                        </div>
                        <div className="text-[10px] sm:text-xs font-bold text-yellow-100">
                          Min Order: <span className="text-white font-black underline decoration-[#FACC15]">Rs. 500/-</span>
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#FACC15] text-[#7F1D1D] text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3 py-0.5 sm:py-1 uppercase shadow-sm">
                      Fast Delivery
                    </span>
                  </div>
                </div>

                <p className="mt-3 sm:mt-4 max-w-md text-[10px] sm:text-xs md:text-sm leading-relaxed text-yellow-100 font-semibold flex items-start gap-1.5">
                  <span>📍 <strong className="text-white">Store:-</strong> #MCB-Z304654, Dr. Mela Ram Hospital Road, Amrik Singh Road, Bathinda. (PB)</span>
                </p>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                  <Link
                    href="#featured"
                    className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#FACC15] px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-black text-[#7F1D1D] shadow-lg transition-all hover:bg-[#EAB308] hover:scale-105 hover:shadow-xl"
                  >
                    <ShoppingCart size={16} /> Shop Collection
                  </Link>

                  <Link
                    href="#schools"
                    className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border-2 border-[#FACC15] bg-white/10 backdrop-blur-md px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all hover:bg-white/20 hover:scale-105"
                  >
                    Find Your School
                  </Link>
                </div>
              </div>

              {/* Hero Image Showcase */}
              <div className="relative flex items-center justify-center min-h-[200px] sm:min-h-[320px] md:min-h-[420px]">
                <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-[#FACC15] bg-[#FEF08A] p-2 sm:p-3.5 shadow-2xl flex items-center justify-center ring-2 sm:ring-4 ring-[#FACC15]/30">
                  <img
                    src="/hero-kids.png"
                    alt="B'Smart Dresses - Students wearing school uniforms"
                    className="h-full max-h-[250px] sm:max-h-[350px] md:max-h-[390px] w-full object-contain filter drop-shadow-[0_12px_24px_rgba(136,19,55,0.25)] transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-3 sm:-bottom-4 right-2 sm:right-4 rounded-xl sm:rounded-2xl bg-white px-3 sm:px-4 py-1.5 sm:py-2.5 shadow-2xl border-2 border-[#7F1D1D] flex items-center gap-1.5 sm:gap-2 z-10">
                  <Star className="fill-[#9F1239] text-[#9F1239]" size={16} />
                  <span className="text-[10px] sm:text-xs font-black text-[#7F1D1D]">100% Quality Fabric</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by School */}
      <section id="schools" className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FFFDF0] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <div className="flex items-center gap-2">
            <span className="h-6 sm:h-8 w-2 rounded-full bg-[#9F1239]" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#7F1D1D]">Shop by School</h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-700">Select your institution to view compliant uniforms</p>

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {SCHOOLS.map(({ name, tag, Icon, highlighted }) => (
              <button
                key={name}
                className={`flex flex-col items-center gap-2 sm:gap-3.5 rounded-xl sm:rounded-2xl border-2 bg-white p-3 sm:p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${highlighted
                  ? "border-[#9F1239] ring-4 ring-[#9F1239]/15 bg-[#FFF5F5]"
                  : "border-[#FCD34D] hover:border-[#9F1239]"
                  }`}
              >
                <span className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF1F2] text-[#9F1239] shadow-inner border border-[#FECDD3]">
                  <Icon size={22} />
                </span>
                <span className="text-xs sm:text-base font-black text-[#7F1D1D] leading-tight">
                  {name}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#9F1239] bg-[#FEFCE8] px-2 py-0.5 rounded-full border border-[#FCD34D]">
                  {tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Uniforms Catalog */}
      <section id="featured" className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FEF8E7] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-6 sm:h-8 w-2 rounded-full bg-[#FACC15]" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#7F1D1D]">School Uniforms Catalog</h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-gray-700">School uniforms and compliant accessories created by school admin</p>
            </div>
            <a href="#featured" className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#9F1239] hover:text-[#7F1D1D] hover:underline">
              View All ({products.length}) <ArrowRight size={16} />
            </a>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#FCD34D] bg-white p-8 sm:p-10 md:p-14 text-center shadow-md">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#FFFDF0] text-[#9F1239] border-2 border-[#FCD34D] shadow-inner">
                <ShoppingCart size={30} />
              </div>
              <h3 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-black text-[#7F1D1D]">No Products Published Yet</h3>
              <p className="mt-2 max-w-md text-xs sm:text-sm font-semibold text-gray-600 leading-relaxed">
                The school uniform catalog is currently empty. Open the <strong className="text-[#9F1239]">B&apos;Smart Admin Expo App</strong> to create and publish your first uniform product live to this website!
              </p>
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((item) => {
                const imageUri = item.imageSrc || item.images?.[0];

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#FCD34D] bg-white p-2.5 sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9F1239] hover:shadow-2xl"
                  >
                    <div>
                      <Link href={`/product/${item.id}`} className="block">
                        <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-[#FFFDF0] aspect-square flex items-center justify-center border border-[#FDE047] p-1 sm:p-2">
                          {imageUri ? (
                            <img
                              src={imageUri}
                              alt={item.name}
                              className="h-full w-full object-contain rounded-lg sm:rounded-xl transition-transform duration-300 group-hover:scale-105 filter contrast-105"
                              style={{ mixBlendMode: 'multiply' }}
                            />
                          ) : (
                            <GarmentThumb
                              tone={item.tone}
                              imageSrc={imageUri}
                              className="h-40 sm:h-56 w-full md:h-64 object-contain rounded-xl"
                              label={item.name}
                            />
                          )}

                          {/* School & Class Badges */}
                          <div className="absolute left-1.5 sm:left-2.5 top-1.5 sm:top-2.5 flex flex-col gap-0.5 sm:gap-1 items-start max-w-[80%]">
                            <Badge variant="school">{item.school}</Badge>
                            {item.applicableClass && (
                              <span className="rounded-full bg-[#7F1D1D] px-2 py-0.5 text-[8px] sm:text-[10px] font-black text-white shadow-sm">
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
                        <Link href={`/product/${item.id}`}>
                          <h3 className="text-xs sm:text-sm font-black text-[#450A0A] line-clamp-2 transition-colors group-hover:text-[#9F1239] min-h-[32px] sm:min-h-[40px]">
                            {item.name}
                          </h3>
                        </Link>

                        {/* Price & Size */}
                        <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1">
                          <span className="text-lg sm:text-2xl font-black text-[#9F1239]">
                            ₹{item.basePrice}
                          </span>
                          {item.sizesText && (
                            <span className="hidden sm:inline rounded-lg border border-[#FCD34D] bg-[#FEFCE8] px-2.5 py-1 text-xs font-extrabold text-[#7F1D1D]">
                              {item.sizesText}
                            </span>
                          )}
                        </div>

                        {/* Stock status */}
                        <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-extrabold text-gray-700 bg-[#FFFDF0] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-[#FDE047] w-fit">
                          <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                            item.stockQuantity === 0 || item.inStock === false
                              ? "bg-red-500"
                              : (item.stockQuantity ?? 50) < 15 || item.stock === "low"
                              ? "bg-amber-500 animate-pulse"
                              : "bg-emerald-500"
                          }`} />
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

                    <Link
                      href={`/product/${item.id}`}
                      className="mt-2.5 sm:mt-4 flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#FACC15] py-2 sm:py-3 text-xs sm:text-sm font-black text-[#7F1D1D] shadow-md transition-all hover:bg-[#EAB308] hover:shadow-lg focus-visible:outline-none"
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full border-t-2 border-[#FCD34D]/60 bg-[#FFFDF0] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10">
          <div className="rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-5 sm:p-8 md:p-14 shadow-lg text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#7F1D1D] tracking-tight">How B&apos;Smart Works</h2>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600">3 Simple Steps to Get Perfect School Uniforms</p>

            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15]">
                  <GraduationCap size={26} />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">1. Select School &amp; Class</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                  Select your school institution and student class group for accurate dress code matching.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15]">
                  <Ruler size={24} />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">2. Pick Size &amp; Order</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                  Choose perfect sizing with transparent pricing guaranteed by school admins.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[#9F1239] text-[#FACC15] shadow-lg border-2 border-[#FACC15]">
                  <Truck size={24} />
                </div>
                <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-black text-[#7F1D1D]">3. Fast Doorstep Delivery</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-xs leading-relaxed">
                  Receive high-quality durable uniforms delivered straight to your home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
