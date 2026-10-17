import StorefrontClient from '@/components/StorefrontClient';

export const metadata = {
  title: "School Uniforms Bathinda - Buy Online",
  description:
    "Buy school uniforms in Bathinda online at B'Smart Dresses. Serving top schools including DPS, St. Xavier, St. Joseph, Silver Oaks, DAV & 10+ institutions across Punjab. Free doorstep delivery on orders above ₹500.",
  keywords: [
    "school uniforms Bathinda",
    "school uniform shop Bathinda",
    "buy school uniforms online Punjab",
    "school uniform home delivery Bathinda",
    "uniform store near me Bathinda",
    "best uniform seller at bathinda",
    "best school dress shop in bathinda",
    "best unifrom dresses",
    "best uniform dresses",
    "Delhi Public School Bathinda uniform",
    "DPS Bathinda uniform",
    "St. Xavier School Bathinda uniform",
    "St. Joseph School Bathinda uniform",
    "DAV Public School Bathinda uniform",
    "Silver Oaks School Bathinda uniform",
  ],
  alternates: {
    canonical: "https://bsmartdresses.com/school-uniforms-bathinda",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bsmartdresses.com/school-uniforms-bathinda",
    siteName: "B'Smart Dresses - School Uniforms Bathinda",
    title: "School Uniforms Bathinda | Buy Online | B'Smart Dresses",
    description:
      "Bathinda's trusted online school uniform store. Order verified uniforms for DPS, St. Xavier, Silver Oaks, DAV and more with fast home delivery.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "School Uniforms Bathinda - B'Smart Dresses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Uniforms Bathinda | Buy Online | B'Smart Dresses",
    description:
      "Buy genuine school uniforms in Bathinda online. Fast doorstep delivery for DPS, St. Xavier, Silver Oaks, DAV & more.",
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
      "name": "School Uniforms Bathinda",
      "item": "https://bsmartdresses.com/school-uniforms-bathinda"
    }
  ]
};

export default function SchoolUniformsBathindaPage() {
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
