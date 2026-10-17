import StorefrontClient from '@/components/StorefrontClient';

export const metadata = {
  title: "Best Uniform Dresses in Bathinda",
  description:
    "Find the best uniform dresses in Bathinda at B'Smart Dresses. Premium durable fabric, perfect school dress fittings, and fast home delivery in Bathinda. Order online for top schools today.",
  keywords: [
    "best unifrom dresses",
    "best uniform dresses",
    "best uniform dresses in bathinda",
    "best uniform dresses bathinda",
    "best unifrom dresses in bathinda",
    "best uniform seller at bathinda",
    "best school dress shop in bathinda",
    "uniform dresses bathinda",
    "school uniform dresses bathinda",
    "bathinda uniform dresses store",
    "DPS Bathinda uniform dress",
    "St Xavier uniform dress Bathinda",
    "Silver Oaks uniform dresses Bathinda",
  ],
  alternates: {
    canonical: "https://bsmartdresses.com/best-uniform-dresses-bathinda",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.com/best-uniform-dresses-bathinda",
    siteName: "B'Smart Dresses - Best Uniform Dresses Bathinda",
    title: "Best Uniform Dresses in Bathinda | B'Smart Dresses",
    description:
      "Looking for the best uniform dresses in Bathinda? B'Smart Dresses offers verified school uniform dresses with fast doorstep delivery across Bathinda.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Best Uniform Dresses in Bathinda - B'Smart Dresses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Uniform Dresses in Bathinda | B'Smart Dresses",
    description:
      "Buy the best uniform dresses in Bathinda online at B'Smart Dresses. Trusted by thousands of families across Punjab.",
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
      "name": "Best Uniform Dresses Bathinda",
      "item": "https://bsmartdresses.com/best-uniform-dresses-bathinda"
    }
  ]
};

export default function BestUniformDressesPage() {
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
