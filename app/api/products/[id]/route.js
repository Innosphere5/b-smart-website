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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', String(id))
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const product = mapFromDb(data);
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Server Error' },
      { status: 500 }
    );
  }
}
