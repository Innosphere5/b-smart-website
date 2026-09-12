"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GarmentThumb from "@/components/GarmentThumb";
import Badge from "@/components/Badge";
import { ShoppingCart, Minus, Plus, Cloud, CheckCircle2, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { getProductById } from "@/data/products";
import { getLiveProductById, getCachedProducts } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const { addToCart } = useCart();
  
  // Fast initial product lookup from static data or cached products
  const [product, setProduct] = useState(() => {
    const staticProd = getProductById(productId);
    if (staticProd) return staticProd;
    const cached = getCachedProducts();
    if (cached) {
      return cached.find((p) => String(p.id) === String(productId)) || null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => !product);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("30");
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      if (productId) {
        try {
          const liveProduct = await getLiveProductById(productId);
          if (liveProduct) {
            setProduct(liveProduct);
            if (Array.isArray(liveProduct.sizes) && liveProduct.sizes.length > 0) {
              setSelectedSize(liveProduct.sizes[0]);
            }
          }
        } catch (err) {
          console.error("Error loading product detail:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, qty);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 3500);
  };

  // High-fidelity Product Detail Skeleton UI while loading
  if (isLoading) {
    return (
      <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
        <ScrollProgressBar />
        <Header activeHref="/" cartCount={0} />
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 md:px-10 md:py-10">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-48 rounded bg-gray-200 animate-pulse mb-6" />

          <div className="grid gap-6 sm:gap-10 md:grid-cols-2 rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D]/60 bg-white p-4 sm:p-6 md:p-10 shadow-lg animate-pulse">
            {/* Gallery Skeleton */}
            <div className="shimmer-box aspect-square min-h-[280px] sm:min-h-[400px] rounded-xl sm:rounded-2xl border border-[#FDE047]/60 flex items-center justify-center">
              <div className="shimmer-effect" />
            </div>

            {/* Content Details Skeleton */}
            <div className="space-y-4">
              <div className="h-5 w-28 rounded-full bg-[#FEF08A]" />
              <div className="h-8 w-3/4 rounded-lg bg-gray-200" />
              <div className="h-10 w-32 rounded-xl bg-[#FECDD3]" />
              <div className="h-20 w-full rounded-xl bg-gray-100" />
              <div className="h-12 w-full rounded-2xl bg-[#FDE047]/70 mt-6" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // If product is not found or null, render clean 404 UI
  if (!product) {
    return (
      <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
        <ScrollProgressBar />
        <Header activeHref="/" cartCount={0} />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10 md:py-16 text-center">
          <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-white text-[#9F1239] border-2 border-[#FCD34D] shadow-md">
            <ShoppingCart size={32} />
          </div>
          <h1 className="mt-5 sm:mt-6 text-2xl sm:text-3xl font-black text-[#7F1D1D]">Product Not Found</h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 max-w-md mx-auto">
            The uniform product you are looking for does not exist or may have been removed.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#FACC15] px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-black text-[#7F1D1D] shadow-md transition-all hover:bg-[#EAB308] hover:shadow-lg"
            >
              Back to Storefront Catalog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.imageSrc];
  const currentImage = galleryImages[activeThumb] || galleryImages[0] || product.imageSrc;
  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : (product.sizePrices && Object.keys(product.sizePrices).length > 0
        ? Object.keys(product.sizePrices)
        : ["28", "30", "32", "34", "36", "38", "40"]);
  const currentPrice = product.sizePrices?.[selectedSize] ?? product.basePrice;

  const breadcrumbs = ["Home", product.school || "School Uniforms", product.name];
  const isCloudinary = currentImage && (currentImage.includes("cloudinary.com") || currentImage.startsWith("http"));

  return (
    <main className="app-frame bg-[#FEF8E7] mobile-bottom-pad">
      <Header activeHref="/" cartCount={2} />

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {/* Breadcrumbs — truncated on mobile */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#7F1D1D] font-bold">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1 sm:gap-1.5">
              {i === 0 ? (
                <Link href="/" className="hover:text-[#9F1239] underline decoration-[#FACC15]">{crumb}</Link>
              ) : (
                <span className={`${i === breadcrumbs.length - 1 ? "font-black text-[#9F1239] truncate max-w-[150px] sm:max-w-none" : ""}`}>
                  {crumb}
                </span>
              )}
              {i !== breadcrumbs.length - 1 && <span className="text-gray-400">›</span>}
            </span>
          ))}
        </nav>

        <div className="mt-4 sm:mt-6 grid gap-6 sm:gap-10 md:grid-cols-2 rounded-2xl sm:rounded-3xl border-2 border-[#FCD34D] bg-white p-4 sm:p-6 md:p-10 shadow-lg">
          {/* Gallery — horizontal thumbs on mobile, vertical on desktop */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Main Image */}
            <div className="relative flex-1 min-h-[280px] sm:min-h-[400px] overflow-hidden rounded-xl sm:rounded-2xl bg-[#FFFDF0] border-2 border-[#FDE047] flex items-center justify-center p-3 sm:p-4 order-1 md:order-2">
              {isCloudinary ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full max-h-[280px] sm:max-h-[450px] w-full object-contain rounded-xl filter contrast-105"
                  style={{ mixBlendMode: 'multiply' }}
                />
              ) : (
                <GarmentThumb
                  tone={product.tone || "white"}
                  imageSrc={currentImage}
                  className="h-[280px] sm:h-[420px] flex-1 rounded-2xl"
                  label={product.name}
                />
              )}
            </div>

            {/* Thumbnails — horizontal scroll on mobile, vertical on desktop */}
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-2 sm:gap-3 order-2 md:order-1 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all ${
                      activeThumb === i ? "border-[#9F1239] ring-4 ring-[#9F1239]/20" : "border-[#FCD34D]"
                    }`}
                  >
                    {img && (img.includes("cloudinary.com") || img.startsWith("http")) ? (
                      <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-contain p-1" style={{ mixBlendMode: 'multiply' }} />
                    ) : (
                      <GarmentThumb tone="white" imageSrc={img} className="h-full w-full" label={`View ${i + 1}`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="school">{product.school}</Badge>
                {product.applicableClass && (
                  <span className="rounded-full bg-[#7F1D1D] text-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black shadow-sm">
                    {product.applicableClass}
                  </span>
                )}
                {product.category && (
                  <span className="rounded-full bg-[#FEFCE8] border border-[#FCD34D] text-[#9F1239] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black">
                    {product.category}
                  </span>
                )}
              </div>

              <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-black text-[#450A0A]">{product.name}</h1>

              {/* Price & Stock */}
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-[#9F1239]">₹{currentPrice}</span>
                <span className="text-[10px] sm:text-xs font-extrabold text-[#7F1D1D] bg-[#FEFCE8] px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-[#FCD34D]">
                  Size {selectedSize} Rate
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-2xs">
                  <ShieldCheck size={12} className="text-emerald-600" /> Admin Verified
                </span>
              </div>

              {/* Size Selector */}
              <div className="mt-5 sm:mt-6">
                <div className="flex items-center justify-between">
                  <span className="field-label mb-0 font-black text-[#7F1D1D] text-xs sm:text-sm">Select Available Size</span>
                  <button className="text-[10px] sm:text-xs font-black text-[#9F1239] underline hover:text-[#7F1D1D]">Size Guide</button>
                </div>
                <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-2 sm:gap-2.5">
                  {sizes.map((size) => {
                    const sizePrice = product.sizePrices?.[size] ?? product.basePrice;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex min-w-[56px] sm:min-w-[70px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex-col items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-[#9F1239] bg-[#9F1239] text-white shadow-md scale-105"
                            : "border-[#FCD34D] text-[#7F1D1D] hover:border-[#9F1239] bg-[#FFFDF0]"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Size {size}</span>
                        <span className={`text-[10px] sm:text-xs font-extrabold mt-0.5 ${isSelected ? "text-[#FEF08A]" : "text-[#9F1239]"}`}>
                          ₹{sizePrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 sm:mt-2.5 text-[10px] sm:text-xs text-gray-700 font-bold flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span>Selected:</span> <strong className="text-[#9F1239] font-black bg-[#FEFCE8] px-1.5 sm:px-2 py-0.5 rounded border border-[#FCD34D]">Size {selectedSize}</strong>
                  <span>•</span>
                  <span>Rate:</span> <strong className="text-[#9F1239] font-black bg-[#FEFCE8] px-1.5 sm:px-2 py-0.5 rounded border border-[#FCD34D]">₹{currentPrice}</strong>
                </p>
              </div>

              {/* Quantity & Stock Status */}
              <div className="mt-5 sm:mt-6">
                <span className="field-label font-black text-[#7F1D1D] text-xs sm:text-sm">Quantity</span>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-1.5">
                  <div className="flex w-fit items-center gap-3 sm:gap-4 rounded-lg sm:rounded-xl border-2 border-[#FCD34D] bg-[#FFFDF0] px-3 sm:px-4 py-1.5 sm:py-2 shadow-xs">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="text-[#9F1239] hover:text-[#7F1D1D] font-black p-1 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 sm:w-8 text-center text-base sm:text-lg font-black text-[#450A0A]">{qty}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => setQty((q) => q + 1)}
                      className="text-[#9F1239] hover:text-[#7F1D1D] font-black p-1 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg sm:rounded-xl bg-[#FEFCE8] border-2 border-[#FCD34D] px-3 sm:px-4 py-2 sm:py-2.5 shadow-xs">
                    <span className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${
                      product.stockQuantity === 0 || product.inStock === false
                        ? "bg-red-500"
                        : (product.stockQuantity ?? 50) < 15 || product.stock === "low"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-emerald-500"
                    }`} />
                    <span className="text-[10px] sm:text-xs font-black text-[#7F1D1D]">
                      {product.stockQuantity === 0 || product.inStock === false
                        ? "Out of Stock"
                        : (product.stockQuantity ?? 50) < 15 || product.stock === "low"
                        ? `Low Stock (${product.stockQuantity ?? 8} available)`
                        : `In Stock (${product.stockQuantity ?? 50} units available)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart CTA — desktop version */}
              <div className="mt-6 sm:mt-8 space-y-3 hidden md:block">
                {justAdded && (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border-2 border-emerald-400 p-3.5 shadow-md animate-bounce">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={20} className="text-emerald-700" />
                      <div>
                        <p className="text-xs font-black text-emerald-900">
                          Added to Cart! (Size {selectedSize}, Qty: {qty})
                        </p>
                        <p className="text-[11px] font-bold text-emerald-700">
                          Subtotal for item: ₹{currentPrice * qty}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/cart"
                      className="flex items-center gap-1 rounded-lg bg-[#881337] px-3 py-1.5 text-xs font-black text-white hover:bg-[#9F1239]"
                    >
                      View Cart <ArrowRight size={14} />
                    </Link>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  className="btn-accent w-full py-4 text-base font-black shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <ShoppingCart size={20} /> Add to Cart (Size {selectedSize} • Total: ₹{currentPrice * qty})
                </button>
              </div>

              {/* Mobile "Added" feedback */}
              {justAdded && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 border-2 border-emerald-400 p-3 shadow-md md:hidden">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black text-emerald-900">
                        Added! (Size {selectedSize}, Qty: {qty})
                      </p>
                      <p className="text-[10px] font-bold text-emerald-700">
                        Subtotal: ₹{currentPrice * qty}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/cart"
                    className="flex items-center gap-1 rounded-lg bg-[#881337] px-2.5 py-1 text-[10px] font-black text-white hover:bg-[#9F1239] shrink-0"
                  >
                    Cart <ArrowRight size={12} />
                  </Link>
                </div>
              )}

            </div>

            {/* Product Details Section */}
            <div className="mt-6 sm:mt-8 border-t-2 border-[#FCD34D] pt-4 sm:pt-6">
              <h2 className="text-[10px] sm:text-xs font-black text-[#9F1239] uppercase tracking-wider">Verified Uniform Credentials &amp; Specification</h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-700 font-semibold">
                {product.details || product.description || `${product.school} uniform for ${product.applicableClass || 'all grades'}. Premium fabric crafted for maximum durability.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="sticky-mobile-cta md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[#450A0A] truncate">{product.name}</p>
            <p className="text-sm font-black text-[#9F1239]">₹{currentPrice * qty} <span className="text-[10px] font-bold text-gray-500">Size {selectedSize} × {qty}</span></p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs font-black text-[#7F1D1D] shadow-md hover:bg-[#EAB308] transition-all shrink-0"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
