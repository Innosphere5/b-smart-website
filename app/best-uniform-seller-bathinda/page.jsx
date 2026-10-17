import StorefrontClient from '@/components/StorefrontClient';

export const metadata = {
  title: "Best Uniform Seller at Bathinda",
  description:
    "Looking for the best uniform seller at Bathinda? B'Smart Dresses is the #1 rated school uniform seller and premier school dress shop in Bathinda. Serving DPS, St. Xavier, St. Joseph, Silver Oaks & DAV schools with fast doorstep delivery.",
  keywords: [
    "best uniform seller at bathinda",
    "best uniform seller in bathinda",
    "uniform seller bathinda",
    "best school dress shop in bathinda",
    "best unifrom dresses",
    "best uniform dresses",
    "school uniform seller bathinda",
    "bathinda uniform seller",
    "buy school uniforms bathinda",
    "DPS Bathinda uniform seller",
    "St Xavier Bathinda school uniforms",
    "DAV school uniform Bathinda",
    "Silver Oaks uniform Bathinda",
    "Amrik Singh Road Bathinda uniform",
  ],
  alternates: {
    canonical: "https://bsmartdresses.com/best-uniform-seller-bathinda",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.com/best-uniform-seller-bathinda",
    siteName: "B'Smart Dresses - Best Uniform Seller at Bathinda",
    title: "Best Uniform Seller at Bathinda | B'Smart Dresses",
    description:
      "B'Smart Dresses is recognized as the best uniform seller at Bathinda. Complete school dresses, uniforms, blazers, shirts, pants & ties for top Punjab schools.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Best Uniform Seller at Bathinda - B'Smart Dresses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Uniform Seller at Bathinda | B'Smart Dresses",
    description:
      "Order quality school uniforms from the best uniform seller at Bathinda. Doorstep delivery for DPS, St. Xavier, St. Joseph, DAV, Silver Oaks & more.",
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
      "name": "Best Uniform Seller at Bathinda",
      "item": "https://bsmartdresses.com/best-uniform-seller-bathinda"
    }
  ]
};

export default function BestUniformSellerPage() {
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
