import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import NotificationToast from "@/components/NotificationToast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata = {
  metadataBase: new URL("https://bsmartdresses.in"),
  title: {
    default: "B'Smart Dresses Bathinda - School Uniforms & Home Delivery",
    template: "%s | B'Smart Dresses Bathinda",
  },
  description:
    "B'Smart Dresses Bathinda - Punjab's trusted school uniform store. Order premium quality uniforms online for Delhi Public School, St. Xavier, St. Joseph, Silver Oaks, St. Paul's & more. Fast doorstep delivery. Min order Rs500.",
  keywords: [
    "B'Smart Dresses","BSmart Dresses","BSmart Bathinda","B Smart Dresses Bathinda","bsmartdresses.in",
    "school uniforms Bathinda","school uniforms Punjab","school uniform home delivery Bathinda",
    "buy school uniforms online Bathinda","school uniform store near me","uniform shop Bathinda",
    "school shirt Bathinda","school pant Bathinda","school skirt Bathinda","school tie Bathinda",
    "school blazer Bathinda","school sweater Bathinda","school track suit Bathinda",
    "Delhi Public School Bathinda uniform","DPS Bathinda uniform","St. Xavier School Bathinda uniform",
    "St. Joseph School Bathinda uniform","Silver Oaks School Bathinda uniform","DAV Public School Bathinda uniform",
    "Amrik Singh Road Bathinda shop","MCB Bathinda uniform store","Bathinda Punjab uniform dealer",
    "order school uniform online Punjab","school uniform doorstep delivery","school uniform online shopping India",
    "affordable school uniforms Punjab","best school uniform store Bathinda","premium school uniforms Punjab",
    "nursery to class 12 uniform","wholesale school uniform Bathinda",
  ],
  alternates: { canonical: "https://bsmartdresses.in" },
  robots: {
    index: true, follow: true, nocache: false,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: {
    google: "REPLACE_WITH_GOOGLE_SEARCH_CONSOLE_CODE",
    yandex: "REPLACE_WITH_YANDEX_CODE",
    other: { "msvalidate.01": ["REPLACE_WITH_BING_WEBMASTER_CODE"] },
  },
  openGraph: {
    type: "website", locale: "en_IN", url: "https://bsmartdresses.in",
    siteName: "B'Smart Dresses Bathinda",
    title: "B'Smart Dresses - Premium School Uniforms | Bathinda, Punjab",
    description: "Order quality school uniforms online from B'Smart Dresses, Bathinda. Serving DPS, St. Xavier, St. Joseph, Silver Oaks, DAV & 10+ top schools.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "B'Smart Dresses Bathinda - School Uniform Store" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "B'Smart Dresses Bathinda - School Uniforms & Home Delivery",
    description: "Punjab's premium school uniform store. Order online for DPS, St. Xavier, Silver Oaks & more. Fast doorstep delivery.",
    images: ["/logo.png"],
  },
  icons: { icon: "/logo.png", apple: "/logo.png", shortcut: "/logo.png" },
  manifest: "/manifest.json",
  applicationName: "B'Smart Dresses",
  authors: [{ name: "B'Smart Dresses Bathinda", url: "https://bsmartdresses.in" }],
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
  "@type": "ClothingStore",
  name: "B'Smart Dresses",
  alternateName: ["BSmart Dresses", "B Smart Dresses Bathinda"],
  url: "https://bsmartdresses.in",
  logo: "https://bsmartdresses.in/logo.png",
  image: "https://bsmartdresses.in/logo.png",
  description: "B'Smart Dresses is Bathinda's trusted school uniform store offering premium quality uniforms for top schools in Punjab with fast doorstep delivery.",
  telephone: "+91-XXXXXXXXXX",
  priceRange: "Rs",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Amrik Singh Road, Dr. Mela Ram Hospital Road",
    addressLocality: "Bathinda",
    addressRegion: "Punjab",
    postalCode: "151001",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 30.211, longitude: 74.9455 },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    opens: "10:00",
    closes: "19:00",
  }],
  sameAs: ["https://bsmartdresses.in"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "School Uniforms",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Shirts" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Pants" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Skirts" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Blazers" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Sweaters" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "School Track Suits" } },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={plusJakartaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen w-full bg-[#FEF8E7] font-sans antialiased text-navy-800 selection:bg-accent/40">
        <NotificationProvider>
          <CartProvider>
            {children}
            <NotificationToast />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
