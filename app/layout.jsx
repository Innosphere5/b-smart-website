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
  title: "B'Smart Dresses — School Uniforms & Delivery",
  description: "Official B'Smart Dresses uniform store with fast home delivery and tracking.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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



