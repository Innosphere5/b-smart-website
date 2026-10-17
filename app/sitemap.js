import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap() {
  const baseUrl = 'https://bsmartdresses.com';
  const currentDate = new Date().toISOString();

  // Core static & programmatic SEO routes with top ranking priority
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/best-uniform-seller-bathinda`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/best-school-dress-shop-in-bathinda`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/best-uniform-dresses-bathinda`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/school-uniforms-bathinda`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.90,
    },
  ];

  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at, created_at')
      .limit(500);

    if (products && Array.isArray(products) && products.length > 0) {
      const productRoutes = products
        .filter((p) => p && p.id)
        .map((p) => ({
          url: `${baseUrl}/product/${p.id}`,
          lastModified: p.updated_at || p.created_at || currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        }));

      return [...staticRoutes, ...productRoutes];
    }
  } catch (error) {
    console.error('Error generating dynamic product sitemap:', error);
  }

  return staticRoutes;
}
