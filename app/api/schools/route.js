import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let serverSchoolsCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 5000; // 5 seconds server-side cache for fast reactivity

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1' || searchParams.get('t');

    // Return cached schools if fresh (< 5 seconds) unless forced
    if (!forceFresh && serverSchoolsCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverSchoolsCache, {
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
        if (registry && Array.isArray(registry.schools)) {
          const deletedSet = new Set(
            (registry.deletedSchools || []).map((s) => String(s).trim().toLowerCase())
          );
          const activeSchools = registry.schools.filter(
            (s) => s && typeof s === 'string' && s.trim().length > 0 && !deletedSet.has(s.trim().toLowerCase())
          );

          const responsePayload = {
            success: true,
            source: 'Supabase Master Registry',
            count: activeSchools.length,
            schools: activeSchools,
            updatedAt: registry.updatedAt || registryRow.created_at,
          };

          serverSchoolsCache = responsePayload;
          lastServerFetchTime = Date.now();

          return NextResponse.json(responsePayload, {
            headers: {
              'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Supabase Master Registry fetch notice:', dbErr.message);
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
        const res = await fetch(`${expressBackend}/api/schools`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.schools)) {
            serverSchoolsCache = data;
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

    // 3. Fallback: Query active products in Supabase
    const { data } = await supabase
      .from('products')
      .select('school')
      .not('school', 'is', null)
      .not('school', 'eq', 'General School');

    const schoolSet = new Set();
    (data || []).forEach((row) => {
      if (row.school && row.school.trim() && row.school !== 'General School') {
        schoolSet.add(row.school.trim());
      }
    });

    const activeSchools = Array.from(schoolSet);
    const responsePayload = {
      success: true,
      source: 'Supabase PostgreSQL Products',
      count: activeSchools.length,
      schools: activeSchools,
    };

    serverSchoolsCache = responsePayload;
    lastServerFetchTime = Date.now();

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      },
    });
  } catch (err) {
    if (serverSchoolsCache) {
      return NextResponse.json(serverSchoolsCache);
    }
    return NextResponse.json(
      { success: false, message: err.message || 'Server Error' },
      { status: 500 }
    );
  }
}
