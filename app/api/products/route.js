import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function mapFromDb(row) {
  if (!row) return null;
  const stock = Number(row.stock_quantity ?? row.stockQuantity ?? 50);
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'General',
    school: row.school || 'General School',
    applicableClass: row.applicable_class || row.applicableClass || 'All Classes',
    description: row.description || row.details || '',
    details: row.description || row.details || '',
    basePrice: Number(row.base_price || row.basePrice || 500),
    imageSrc: row.image_src || row.imageSrc || '',
    images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
    sizes: row.sizes ? (typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes) : ['28', '30', '32', '34', '36'],
    sizesText: row.sizes_text || row.sizesText || 'Multiple Sizes',
    sizePrices: row.size_prices ? (typeof row.size_prices === 'string' ? JSON.parse(row.size_prices) : row.size_prices) : {},
    inStock: stock > 0 && row.in_stock !== false,
    stockQuantity: stock,
    createdAt: row.created_at || new Date().toISOString()
  };
}

export async function GET() {
  try {
    // 1. Try Express backend ONLY if a distinct external backend URL is configured
    const expressBackend = (process.env.EXPRESS_BACKEND_URL || process.env.NEXT_PUBLIC_EXPRESS_URL || '').replace(/\/+$/, '');
    if (expressBackend && !expressBackend.includes('localhost')) {
      try {
        const res = await fetch(`${expressBackend}/api/products`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            return NextResponse.json(data);
          }
        }
      } catch (e) {
        // Fallback to Supabase direct query below
      }
    }

    // 2. Direct Supabase DB query
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const products = (data || []).map(mapFromDb).filter(Boolean);
    return NextResponse.json({
      success: true,
      database: 'Supabase PostgreSQL',
      count: products.length,
      products,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Server Error' },
      { status: 500 }
    );
  }
}
