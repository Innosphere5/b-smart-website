import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_CLASSES = [
  'NURSERY - KG',
  'NUR - II',
  'NUR - V',
  'NUR - X',
  'I - II',
  'III - V',
  'I - V',
  'I - VIII',
  'I - X',
  'VI - VIII',
  'VI - X',
  'IX - X',
  'XI - XII',
  'All Classes'
];

let serverClassesCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 15000; // 15 seconds server-side cache

export async function GET() {
  try {
    if (serverClassesCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverClassesCache, {
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
        const res = await fetch(`${expressBackend}/api/classes`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.classes)) {
            serverClassesCache = data;
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

    // 2. Direct Supabase DB query fallback
    const { data } = await supabase
      .from('products')
      .select('applicable_class')
      .not('applicable_class', 'is', null);

    const classSet = new Set(DEFAULT_CLASSES);
    (data || []).forEach((row) => {
      const cls = row.applicable_class?.trim();
      if (cls && cls !== 'All Classes') {
        classSet.add(cls);
      }
    });

    const activeClasses = Array.from(classSet);
    const responsePayload = {
      success: true,
      source: 'Default & Supabase Products',
      count: activeClasses.length,
      classes: activeClasses,
    };

    serverClassesCache = responsePayload;
    lastServerFetchTime = Date.now();

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
      },
    });
  } catch (err) {
    if (serverClassesCache) {
      return NextResponse.json(serverClassesCache);
    }
    return NextResponse.json({
      success: true,
      classes: DEFAULT_CLASSES,
      count: DEFAULT_CLASSES.length,
    });
  }
}
