import StorefrontClient from '@/components/StorefrontClient';

export const metadata = {
  title: "Best School Dress Shop in Bathinda",
  description:
    "B'Smart Dresses is the best school dress shop in Bathinda, Punjab. Offering high-quality school dresses, shirts, trousers, skirts, blazers, sweaters & accessories for DPS, St. Xavier, St. Joseph, Silver Oaks & DAV with fast home delivery.",
  keywords: [
    "best school dress shop in bathinda",
    "best school dress shop bathinda",
    "school dress shop in bathinda",
    "school dress shop bathinda",
    "school dress seller bathinda",
    "best uniform seller at bathinda",
    "best unifrom dresses",
    "best uniform dresses",
    "buy school dress bathinda",
    "bathinda school dresses",
    "school dress online bathinda",
    "DPS Bathinda school dress",
    "St Xavier Bathinda school dress",
    "Silver Oaks school dress Bathinda",
  ],
  alternates: {
    canonical: "https://bsmartdresses.com/best-school-dress-shop-in-bathinda",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.com/best-school-dress-shop-in-bathinda",
    siteName: "B'Smart Dresses - Best School Dress Shop in Bathinda",
    title: "Best School Dress Shop in Bathinda | B'Smart Dresses",
    description:
      "Looking for the best school dress shop in Bathinda? B'Smart Dresses provides verified uniforms, dresses, ties and belts for top schools in Punjab.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Best School Dress Shop in Bathinda - B'Smart Dresses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best School Dress Shop in Bathinda | B'Smart Dresses",
    description:
      "Buy durable, comfortable school dresses from Bathinda's best school dress shop. Fast doorstep delivery across Bathinda, Punjab.",
    images: ["/logo.jpg"],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://bsmartdresses.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Best School Dress Shop in Bathinda",
      "item": "https://bsmartdresses.com/best-school-dress-shop-in-bathinda"
    }
  ]
};

export default function BestSchoolDressShopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StorefrontClient />
    </>
  );
}
