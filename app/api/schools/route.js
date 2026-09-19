import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let serverSchoolsCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 15000; // 15 seconds server-side cache

export async function GET() {
  try {
    // Return cached schools if fresh (< 15 seconds) to reduce latency and DB load
    if (serverSchoolsCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverSchoolsCache, {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        },
      });
    }

    // 1. Try Express backend API if configured
    const expressBackend = (
      process.env.EXPRESS_BACKEND_URL ||
      process.env.NEXT_PUBLIC_EXPRESS_URL ||
      'https://admin-app-backend-i5tk.onrender.com'
    ).replace(/\/+$/, '');

    if (expressBackend) {
      try {
        const res = await fetch(`${expressBackend}/api/schools`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.schools)) {
            serverSchoolsCache = data;
            lastServerFetchTime = Date.now();
            return NextResponse.json(data, {
              headers: {
                'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
              },
            });
          }
        }
      } catch (e) {
        // Fallback to Supabase direct query below
      }
    }

    // 2. Direct Supabase DB query fallback: collect distinct active schools from active products
    const { data, error } = await supabase
      .from('products')
      .select('school')
      .not('school', 'is', null)
      .not('school', 'eq', 'General School');

    if (error) {
      if (serverSchoolsCache) {
        return NextResponse.json(serverSchoolsCache);
      }
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

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
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
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
