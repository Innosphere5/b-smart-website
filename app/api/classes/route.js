import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let serverClassesCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 5000; // 5 seconds server-side cache for fast reactivity

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1' || searchParams.get('t');

    // Return cached classes if fresh (< 5 seconds) unless forced
    if (!forceFresh && serverClassesCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverClassesCache, {
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
        if (registry && Array.isArray(registry.classes)) {
          const deletedSet = new Set(
            (registry.deletedClasses || []).map((c) => String(c).trim().toLowerCase())
          );
          const activeClasses = registry.classes.filter(
            (c) => c && typeof c === 'string' && c.trim().length > 0 && !deletedSet.has(c.trim().toLowerCase())
          );

          const responsePayload = {
            success: true,
            source: 'Supabase Master Registry',
            count: activeClasses.length,
            classes: activeClasses,
            updatedAt: registry.updatedAt || registryRow.created_at,
          };

          serverClassesCache = responsePayload;
          lastServerFetchTime = Date.now();

          return NextResponse.json(responsePayload, {
            headers: {
              'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Supabase Master Registry classes fetch notice:', dbErr.message);
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
        const res = await fetch(`${expressBackend}/api/classes`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.classes)) {
            serverClassesCache = data;
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

    // 3. Fallback: Query distinct active classes from Supabase products (without hardcoded defaults resurrecting deletions)
    const { data } = await supabase
      .from('products')
      .select('applicable_class')
      .not('applicable_class', 'is', null)
      .not('applicable_class', 'eq', 'All Classes');

    const classSet = new Set();
    (data || []).forEach((row) => {
      const cls = row.applicable_class?.trim();
      if (cls && cls.toLowerCase() !== 'all classes' && cls.toLowerCase() !== 'all') {
        classSet.add(cls);
      }
    });

    const activeClasses = Array.from(classSet);
    const responsePayload = {
      success: true,
      source: 'Supabase Products Fallback',
      count: activeClasses.length,
      classes: activeClasses.length > 0 ? activeClasses : ['All Classes'],
    };

    serverClassesCache = responsePayload;
    lastServerFetchTime = Date.now();

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    if (serverClassesCache) {
      return NextResponse.json(serverClassesCache);
    }
    return NextResponse.json({
      success: true,
      classes: ['All Classes'],
      count: 1,
    });
  }
}
