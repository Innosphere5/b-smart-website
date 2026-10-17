import StorefrontClient from '@/components/StorefrontClient';

export const metadata = {
  title: "Best Uniform Seller at Bathinda | Best School Dress Shop in Bathinda | B'Smart Dresses",
  description:
    "B'Smart Dresses is the best uniform seller at Bathinda & best school dress shop in Bathinda. Buy best uniform dresses, school uniforms, blazers, shirts, skirts & tracksuits for DPS, St. Xavier, St. Joseph, Silver Oaks & DAV. Fast home delivery across Bathinda.",
  alternates: {
    canonical: "https://bsmartdresses.com",
  },
};

export default function HomePage() {
  return <StorefrontClient />;
}
