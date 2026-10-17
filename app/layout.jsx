import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import { AuthProvider } from "@/lib/AuthContext";
import { ShopStatusProvider } from "@/lib/ShopStatusContext";
import NotificationToast from "@/components/NotificationToast";
import ShopClosureBanner from "@/components/ShopClosureBanner";
import ShopClosurePopup from "@/components/ShopClosurePopup";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // prevents render-blocking / improves CLS + LCP (Core Web Vitals -> ranking signal)
});

export const metadata = {
  metadataBase: new URL("https://bsmartdresses.com"),
  title: {
    default: "Best Uniform Seller at Bathinda | Best School Dress Shop in Bathinda | B'Smart Dresses",
    template: "%s | B'Smart Dresses Bathinda",
  },
  description:
    "B'Smart Dresses is the best uniform seller at Bathinda & best school dress shop in Bathinda. Buy best uniform dresses, school uniforms, blazers, shirts, skirts & tracksuits for DPS, St. Xavier, St. Joseph, Silver Oaks & DAV. Fast home delivery across Bathinda.",
  keywords: [
    // Exact Target Search Keywords
    "best uniform seller at bathinda",
    "best uniform seller in bathinda",
    "best school dress shop in bathinda",
    "best school dress shop bathinda",
    "best unifrom dresses",
    "best uniform dresses",
    "best uniform dresses in bathinda",
    "best uniform dresses bathinda",
    "school uniform seller bathinda",
    "uniform seller bathinda",
    "school dress shop bathinda",
    "school dress seller bathinda",
    "best school dresses bathinda",
    "school dress shop in bathinda",
    "buy school dresses in bathinda",
    "school dresses in bathinda",
    // Brand
    "B'Smart Dresses", "BSmart Dresses Bathinda", "B Smart Dresses",
    // Core local intent
    "school uniforms Bathinda", "school uniform shop Bathinda", "buy school uniforms online Punjab",
    "school uniform home delivery Bathinda", "uniform store near me Bathinda",
    // Product-level
    "school shirt Bathinda", "school pant uniform", "school skirt uniform",
    "school tie Bathinda", "school blazer uniform", "school sweater uniform", "school track suit uniform",
    // School-specific (highest commercial intent)
    "Delhi Public School Bathinda uniform", "DPS Bathinda uniform",
    "St. Xavier School Bathinda uniform", "St. Joseph School Bathinda uniform",
    "Silver Oaks School Bathinda uniform", "DAV Public School Bathinda uniform",
    "St. Paul's School Bathinda uniform",
    // Local
    "Amrik Singh Road Bathinda uniform shop", "Bathinda Punjab school uniform dealer",
    // Long-tail
    "nursery to class 12 school uniform", "wholesale school uniform Bathinda Punjab",
    "affordable school uniforms Punjab", "premium school uniforms Punjab",
  ],
  alternates: { canonical: "https://bsmartdresses.com" },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE",
    yandex: "REPLACE_WITH_YANDEX_CODE",
    other: { "msvalidate.01": ["REPLACE_WITH_BING_WEBMASTER_CODE"] },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.com",
    siteName: "B'Smart Dresses - Best Uniform Seller at Bathinda",
    title: "Best Uniform Seller at Bathinda | Best School Dress Shop - B'Smart Dresses",
    description:
      "Bathinda's top-rated uniform seller & school dress shop. Shop the best uniform dresses online for DPS, St. Xavier, St. Joseph, Silver Oaks & DAV with fast home delivery.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "B'Smart Dresses - Best Uniform Seller & School Dress Shop at Bathinda",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Uniform Seller at Bathinda | Best School Dress Shop in Bathinda",
    description:
      "Buy the best uniform dresses in Bathinda online at B'Smart Dresses. Serving DPS, St. Xavier, St. Joseph, Silver Oaks, DAV & top Punjab schools with fast delivery.",
    images: ["/logo.jpg"],
  },
  icons: { icon: "/logo.jpg", apple: "/logo.jpg", shortcut: "/logo.jpg" },
  manifest: "/manifest.json",
  applicationName: "B'Smart Dresses",
  authors: [{ name: "B'Smart Dresses Bathinda", url: "https://bsmartdresses.com" }],
  creator: "B'Smart Dresses Bathinda",
  publisher: "B'Smart Dresses Bathinda",
  category: "Shopping / School Uniforms",
  classification: "Retail / School Uniform Store",
  other: {
    "geo.region": "IN-PB",
    "geo.placename": "Bathinda, Punjab, India",
    "geo.position": "30.2110;74.9455",
    ICBM: "30.2110, 74.9455",
    language: "English",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FEF8E7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ClothingStore", "LocalBusiness", "Store"],
      "@id": "https://bsmartdresses.com/#localbusiness",
      name: "B'Smart Dresses - Best Uniform Seller at Bathinda",
      alternateName: [
        "B'Smart Dresses",
        "BSmart Dresses Bathinda",
        "Best Uniform Seller at Bathinda",
        "Best Uniform Seller in Bathinda",
        "Best School Dress Shop in Bathinda",
        "Best Uniform Dresses Bathinda",
        "B Smart Dresses"
      ],
      url: "https://bsmartdresses.com",
      logo: "https://bsmartdresses.com/logo.jpg",
      image: [
        "https://bsmartdresses.com/logo.jpg",
        "https://bsmartdresses.com/hero-kids.png"
      ],
      description:
        "B'Smart Dresses is the top-rated school uniform seller and premier school dress shop in Bathinda, Punjab. Offering best uniform dresses, school shirts, trousers, skirts, blazers, sweaters, tracksuits, ties, and belts for DPS Bathinda, St. Xavier, St. Joseph, Silver Oaks, DAV and top schools with fast home delivery.",
      telephone: "+91-9888388170",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
      address: {
        "@type": "PostalAddress",
        streetAddress: "#MCB-Z304654, Dr. Mela Ram Hospital Road, Amrik Singh Road",
        addressLocality: "Bathinda",
        addressRegion: "Punjab",
        postalCode: "151001",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 30.211,
        longitude: 74.9455,
      },
      areaServed: [
        { "@type": "City", name: "Bathinda" },
        { "@type": "AdministrativeArea", name: "Bathinda District" },
        { "@type": "State", name: "Punjab" },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "20:00",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "184",
        bestRating: "5",
        worstRating: "1",
      },
      sameAs: [
        "https://bsmartdresses.com",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "School Uniforms & Best Uniform Dresses",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Best Uniform Dresses" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Shirts" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Pants and Trousers" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Skirts" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Blazers" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Sweaters" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Track Suits" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Ties and Belts" } },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://bsmartdresses.com/#website",
      url: "https://bsmartdresses.com",
      name: "B'Smart Dresses - Best Uniform Seller at Bathinda",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://bsmartdresses.com/?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://bsmartdresses.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Who is the best uniform seller at Bathinda?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "B'Smart Dresses is recognized as the best uniform seller at Bathinda, located at Dr. Mela Ram Hospital Road, Amrik Singh Road, Bathinda. They stock verified premium school uniforms for DPS, St. Xavier, St. Joseph, Silver Oaks, DAV, and top Punjab schools with fast doorstep delivery.",
          },
        },
        {
          "@type": "Question",
          name: "Which is the best school dress shop in Bathinda?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "B'Smart Dresses is the best school dress shop in Bathinda, offering an extensive selection of school dresses including shirts, trousers, skirts, blazers, sweaters, tracksuits, ties, and belts made from durable, breathable fabrics.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I buy the best uniform dresses online in Bathinda?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can buy the best uniform dresses directly online through B'Smart Dresses at bsmartdresses.com with convenient doorstep delivery across Bathinda, Punjab.",
          },
        },
        {
          "@type": "Question",
          name: "Which schools in Bathinda does B'Smart Dresses provide uniforms for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "B'Smart Dresses provides uniforms for Delhi Public School (DPS) Bathinda, St. Xavier School, St. Joseph School, Silver Oaks School, DAV Public School, St. Paul's School, and other leading schools in the region.",
          },
        },
        {
          "@type": "Question",
          name: "What are the store timings and phone number of B'Smart Dresses Bathinda?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Store hours are Monday through Saturday from 10:00 AM to 8:00 PM. You can contact the store helpline directly at +91 9888388170.",
          },
        },
      ],
    },
  ],
};

import DeliveryClosedGate from "@/components/DeliveryClosedGate";
import { supabase } from "@/lib/supabase";

async function getInitialShopStatus() {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("message")
      .eq("id", "sys_shop_status")
      .maybeSingle();

    if (!error && data?.message) {
      const parsed = JSON.parse(data.message);
      return parsed;
    }
  } catch (e) {
    // Graceful fallback; client will fetch if server cannot reach
  }
  return null;
}

export default async function RootLayout({ children }) {
  const initialShopStatus = await getInitialShopStatus();

  return (
    <html lang="en-IN" className={plusJakartaSans.variable}>
      <head>
        {/* Preconnect for Google Fonts / any external asset host — speeds up LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen w-full bg-[#FEF8E7] font-sans antialiased text-navy-800 selection:bg-accent/40">
        <AuthProvider>
          <ShopStatusProvider initialStatus={initialShopStatus}>
            <NotificationProvider>
              <CartProvider>
                <DeliveryClosedGate>
                  <ShopClosureBanner />
                  {children}
                  <NotificationToast />
                  <ShopClosurePopup />
                </DeliveryClosedGate>
              </CartProvider>
            </NotificationProvider>
          </ShopStatusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}