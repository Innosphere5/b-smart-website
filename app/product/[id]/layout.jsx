import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const { data: product } = await supabase
      .from('products')
      .select('name, school, applicable_class, category, base_price, image_src, description')
      .eq('id', String(id))
      .maybeSingle();

    if (product && product.name) {
      const school = product.school || 'Bathinda School';
      const applicableClass = product.applicable_class || 'All Classes';
      const title = `${product.name} - ${school}`;
      const description = `Buy ${product.name} for ${school} (${applicableClass}) at B'Smart Dresses, Bathinda's best school dress shop and top uniform seller. Verified quality, perfect fit, and fast doorstep delivery in Bathinda.`;
      const imageUrl = product.image_src || 'https://bsmartdresses.com/logo.jpg';

      return {
        title,
        description,
        keywords: [
          product.name,
          `${school} uniform`,
          `${school} dress`,
          "best uniform seller at bathinda",
          "best school dress shop in bathinda",
          "best unifrom dresses",
          "best uniform dresses",
          "school dress bathinda",
          "school uniforms bathinda",
          product.category || "uniform",
        ],
        alternates: {
          canonical: `https://bsmartdresses.com/product/${id}`,
        },
        openGraph: {
          title,
          description,
          url: `https://bsmartdresses.com/product/${id}`,
          images: [{ url: imageUrl, alt: product.name }],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Error in generateMetadata for product:', error);
  }

  return {
    title: "School Uniform Product | B'Smart Dresses - Best Uniform Seller at Bathinda",
    description: "Shop quality school uniforms online at B'Smart Dresses, Bathinda's premier school dress shop. Fast doorstep delivery.",
  };
}

export default async function ProductLayout({ children, params }) {
  const { id } = await params;
  let productJsonLd = null;

  try {
    const { data: product } = await supabase
      .from('products')
      .select('id, name, school, applicable_class, category, base_price, image_src, description, in_stock, stock_quantity')
      .eq('id', String(id))
      .maybeSingle();

    if (product && product.name) {
      const price = Number(product.base_price || 500);
      const inStock = product.in_stock !== false && (product.stock_quantity == null || Number(product.stock_quantity) > 0);

      productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || `${product.name} for ${product.school || 'Bathinda School'} (${product.applicable_class || 'All Classes'}).`,
        image: product.image_src || "https://bsmartdresses.com/logo.jpg",
        brand: {
          "@type": "Brand",
          name: "B'Smart Dresses",
        },
        offers: {
          "@type": "Offer",
          url: `https://bsmartdresses.com/product/${id}`,
          priceCurrency: "INR",
          price: price,
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "ClothingStore",
            name: "B'Smart Dresses - Best Uniform Seller at Bathinda",
          },
        },
      };
    }
  } catch (e) {
    // Graceful fallback
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
