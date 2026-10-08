import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let serverShopStatusCache = null;
let lastServerFetchTime = 0;
const SERVER_CACHE_TTL = 3000; // 3 seconds server-side cache for rapid live updates

function formatIndianDate(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return '';
  }
}

function getDefaultShopStatus() {
  const now = new Date();
  const reopen = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const formatted = formatIndianDate(reopen);

  return {
    isClosed: false,
    closureDays: 2,
    startDate: now.toISOString(),
    reopenDate: reopen.toISOString(),
    reopenDateFormatted: formatted,
    bannerTitle: 'Shop Temporarily Closed for 2 Days',
    bannerMessage: `Our shop is closed for 2 days. We will reopen on ${formatted}. Online orders placed now will be processed as soon as we reopen!`,
    allowOrders: true,
    showPopup: true,
    showTopBanner: true,
    updatedAt: now.toISOString(),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1' || searchParams.get('t');

    if (!forceFresh && serverShopStatusCache && Date.now() - lastServerFetchTime < SERVER_CACHE_TTL) {
      return NextResponse.json(serverShopStatusCache, {
        headers: {
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=15',
        },
      });
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('message, created_at')
        .eq('id', 'sys_shop_status')
        .maybeSingle();

      if (!error && data && data.message) {
        const parsed = JSON.parse(data.message);
        if (parsed && typeof parsed === 'object') {
          if (parsed.reopenDate && !parsed.reopenDateFormatted) {
            parsed.reopenDateFormatted = formatIndianDate(parsed.reopenDate);
          }

          const responsePayload = {
            success: true,
            source: 'Supabase Database',
            shopStatus: parsed,
          };

          serverShopStatusCache = responsePayload;
          lastServerFetchTime = Date.now();

          return NextResponse.json(responsePayload, {
            headers: {
              'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=15',
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Supabase Shop Status fetch notice:', dbErr.message);
    }

    // Default fallback
    const fallbackPayload = {
      success: true,
      source: 'Default Fallback',
      shopStatus: getDefaultShopStatus(),
    };
    return NextResponse.json(fallbackPayload);
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
      shopStatus: getDefaultShopStatus(),
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const current = serverShopStatusCache?.shopStatus || getDefaultShopStatus();

    const merged = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (merged.reopenDate) {
      merged.reopenDateFormatted = formatIndianDate(merged.reopenDate);
    }

    const payload = {
      id: 'sys_shop_status',
      order_id: 'SYSTEM',
      type: 'shop_status',
      title: 'Shop Status & Closure Banner',
      message: JSON.stringify(merged),
      target_role: 'all',
      read: true,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('notifications')
      .upsert([payload], { onConflict: 'id' });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    serverShopStatusCache = { success: true, shopStatus: merged };
    lastServerFetchTime = Date.now();

    return NextResponse.json({ success: true, shopStatus: merged });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
