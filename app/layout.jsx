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
  // ── Core Identity ──────────────────────────────────────────────────────────
  title: {
    default: "B'Smart Dresses Bathinda — School Uniforms & Home Delivery",
    template: "%s | B'Smart Dresses Bathinda",
  },
  description:
    "B'Smart Dresses Bathinda — Punjab's trusted school uniform store. Order premium quality uniforms online for Delhi Public School, St. Xavier, St. Joseph, Silver Oaks, St. Paul's & more. Fast doorstep delivery. Min order ₹500.",

  // ── SEO Keywords ───────────────────────────────────────────────────────────
  keywords: [
    // Brand & Store
    "B'Smart Dresses",
    "BSmart Dresses",
    "BSmart Bathinda",
    "B Smart Dresses Bathinda",
    "bsmartdresses.in",
    "B'Smart school uniform store",
    "B Smart school uniforms Bathinda",

    // Core Product
    "school uniforms Bathinda",
    "school uniforms Punjab",
    "school uniform home delivery Bathinda",
    "buy school uniforms online Bathinda",
    "school uniform store near me",
    "uniform shop Bathinda",
    "kids school dress Bathinda",
    "school dress online Bathinda",
    "school uniform delivery Punjab",

    // Clothing Categories
    "school shirt Bathinda",
    "school pant Bathinda",
    "school skirt Bathinda",
    "school tie Bathinda",
    "school belt Bathinda",
    "school socks Bathinda",
    "school track suit Bathinda",
    "school sweater Bathinda",
    "school pullover Bathinda",
    "school blazer Bathinda",
    "school coat Bathinda",
    "school jacket Bathinda",
    "school shoes Bathinda",
    "school accessories Bathinda",
    "stocking uniform Bathinda",
    "lower uniform Bathinda",
    "T-shirt school uniform Bathinda",

    // Schools Served
    "Delhi Public School Bathinda uniform",
    "DPS Bathinda uniform",
    "St. Xavier School Bathinda uniform",
    "St. Joseph School Bathinda uniform",
    "Silver Oaks School Bathinda uniform",
    "Silver Oaks Global School Bathinda uniform",
    "St. Paul's School Bathinda uniform",
    "Xavier World School Bathinda uniform",
    "St. Kabir Convent School Bhuchoo Khurd uniform",
    "St. Kabir Convent School Model Town Bathinda uniform",
    "The Sanskaar School Talwandi Sabo uniform",
    "DAV Public School Bathinda uniform",

    // Local SEO
    "Amrik Singh Road Bathinda shop",
    "Dr. Mela Ram Hospital Road Bathinda",
    "MCB Bathinda uniform store",
    "Bathinda school dress shop",
    "Bathinda Punjab uniform dealer",
    "uniform shop near Bathinda",
    "Talwandi Sabo school uniform",
    "Bhuchoo Khurd school uniform",
    "Model Town Bathinda uniform",

    // Intent / Transactional
    "order school uniform online Punjab",
    "school uniform delivery near me",
    "school uniform doorstep delivery",
    "school uniform order form",
    "school uniform online shopping India",
    "affordable school uniforms Punjab",
    "best school uniform store Bathinda",
    "premium school uniforms Punjab",
    "class-wise school uniform",
    "nursery to class 12 uniform",
    "wholesale school uniform Bathinda",
  ],

  // ── Canonical & Robots ─────────────────────────────────────────────────────
  alternates: {
    canonical: "https://bsmartdresses.in",
  },
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

  // ── Open Graph (Facebook / WhatsApp / LinkedIn) ────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.in",
    siteName: "B'Smart Dresses Bathinda",
    title: "B'Smart Dresses — Premium School Uniforms | Bathinda, Punjab",
    description:
      "Order quality school uniforms online from B'Smart Dresses, Bathinda. Serving DPS, St. Xavier, St. Joseph, Silver Oaks, DAV & 10+ top schools. Fast doorstep delivery across Bathinda. Min order ₹500.",
    images: [
      {
        url: "https://bsmartdresses.in/logo.png",
        width: 1200,
        height: 630,
        alt: "B'Smart Dresses Bathinda – School Uniform Store",
      },
    ],
  },

  // ── Twitter / X Card ───────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "B'Smart Dresses Bathinda — School Uniforms & Home Delivery",
    description:
      "Punjab's premium school uniform store. Order online for DPS, St. Xavier, Silver Oaks & more. Fast doorstep delivery. Min ₹500.",
    images: ["https://bsmartdresses.in/logo.png"],
  },

  // ── Icons ──────────────────────────────────────────────────────────────────
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },

  // ── App-level meta ─────────────────────────────────────────────────────────
  applicationName: "B'Smart Dresses",
  authors: [{ name: "B'Smart Dresses Bathinda" }],
  creator: "B'Smart Dresses Bathinda",
  publisher: "B'Smart Dresses Bathinda",
  category: "Shopping / School Uniforms",
  classification: "Retail / School Uniform Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
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



