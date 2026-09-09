import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

let fallbackNotifs = [
  {
    id: 'notif-seed-1',
    orderId: 'BS-1024',
    type: 'order_created',
    title: 'New Uniform Order Received',
    message: 'Order #BS1024 placed for Delhi Public School (₹1,750)',
    targetRole: 'all',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-seed-2',
    orderId: 'BS-1023',
    type: 'order_accepted',
    title: 'Order Accepted & Scheduled',
    message: 'Order #BS1023 accepted. Expected Delivery: Today by 5:30 PM',
    targetRole: 'all',
    read: false,
    createdAt: new Date(Date.now() - 72000000).toISOString()
  }
];

function mapFromDb(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    orderId: row.order_id || row.orderId,
    type: row.type || 'general',
    title: row.title,
    message: row.message,
    targetRole: row.target_role || row.targetRole || 'all',
    customerMobile: row.customer_mobile || row.customerMobile || '',
    read: Boolean(row.read),
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const mobile = searchParams.get('mobile');

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data, error } = await query;

    let notifs = fallbackNotifs;
    if (!error && Array.isArray(data) && data.length > 0) {
      notifs = data.map(mapFromDb).filter(Boolean);
    }

    if (role && role !== 'all') {
      notifs = notifs.filter((n) => n.targetRole === 'all' || n.targetRole === role);
    }
    if (mobile) {
      notifs = notifs.filter((n) => !n.customerMobile || n.customerMobile === mobile);
    }

    return NextResponse.json({
      success: true,
      count: notifs.length,
      notifications: notifs
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      count: fallbackNotifs.length,
      notifications: fallbackNotifs
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newNotif = {
      id: body.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id: body.orderId || null,
      type: body.type || 'general',
      title: body.title || 'Uniform Update',
      message: body.message || '',
      target_role: body.targetRole || 'all',
      customer_mobile: body.customerMobile || '',
      read: false,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('notifications').insert([newNotif]);
    } catch (e) {}

    const formatted = mapFromDb(newNotif);
    fallbackNotifs.unshift(formatted);

    return NextResponse.json({ success: true, notification: formatted }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
