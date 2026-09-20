import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let serverCategoriesCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 5000; // 5 seconds server-side cache for fast reactivity

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1' || searchParams.get('t');

    // Return cached categories if fresh (< 5 seconds) unless forced
    if (!forceFresh && serverCategoriesCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverCategoriesCache, {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      });
    }

    // 1. Primary: Direct Supabase Master Registry (instant, cloud-persisted, shared)
    try {
      const { data: registryRow } = await supabase
        .from('notifications')
        .select('message, created_at')
        .eq('id', 'sys_master_registry')
        .maybeSingle();

      if (registryRow && registryRow.message) {
        const registry = JSON.parse(registryRow.message);
        if (registry && Array.isArray(registry.categories)) {
          const deletedSet = new Set(
            (registry.deletedCategories || []).map((c) => String(c).trim().toLowerCase())
          );
          const activeCategories = registry.categories.filter(
            (c) => c && typeof c === 'string' && c.trim().length > 0 && !deletedSet.has(c.trim().toLowerCase())
          );

          const responsePayload = {
            success: true,
            source: 'Supabase Master Registry',
            count: activeCategories.length,
            categories: activeCategories,
            updatedAt: registry.updatedAt || registryRow.created_at,
          };

          serverCategoriesCache = responsePayload;
          lastServerFetchTime = Date.now();

          return NextResponse.json(responsePayload, {
            headers: {
              'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Supabase Master Registry categories fetch notice:', dbErr.message);
    }

    // 2. Secondary: Express backend API with fast 2.5s abort timeout
    const expressBackend = (
      process.env.EXPRESS_BACKEND_URL ||
      process.env.NEXT_PUBLIC_EXPRESS_URL ||
      'https://admin-app-backend-i5tk.onrender.com'
    ).replace(/\/+$/, '');

    if (expressBackend) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${expressBackend}/api/categories`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.categories)) {
            serverCategoriesCache = data;
            lastServerFetchTime = Date.now();
            return NextResponse.json(data, {
              headers: {
                'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
              },
            });
          }
        }
      } catch (e) {
        // Fallback to active products query below
      }
    }

    // 3. Fallback: Query distinct active categories from Supabase products
    const { data } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .not('category', 'eq', 'General');

    const catSet = new Set();
    (data || []).forEach((row) => {
      const c = row.category?.trim();
      if (c && c.toLowerCase() !== 'general') {
        catSet.add(c);
      }
    });

    const activeCategories = Array.from(catSet);
    const responsePayload = {
      success: true,
      source: 'Supabase Products Fallback',
      count: activeCategories.length,
      categories: activeCategories.length > 0 ? activeCategories : ['General'],
    };

    serverCategoriesCache = responsePayload;
    lastServerFetchTime = Date.now();

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    if (serverCategoriesCache) {
      return NextResponse.json(serverCategoriesCache);
    }
    return NextResponse.json({
      success: true,
      categories: ['General'],
      count: 1,
    });
  }
}
