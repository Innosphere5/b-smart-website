import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Shared fallback orders in case Supabase table is not yet created
const fallbackOrders = [
  {
    id: 'BS-1024',
    orderNumber: '#BS1024',
    customerName: 'Rahul Sharma',
    customerMobile: '+91 98765 43210',
    customerEmail: 'rahul.sharma@example.com',
    deliveryAddress: {
      address1: 'House No. 142, Street 4, Model Town',
      address2: 'Near Kali Mata Temple',
      city: 'Bathinda',
      state: 'Punjab',
      postal: '151001'
    },
    school: 'Delhi Public School',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'Boys Full-Sleeve White Shirt (Bathinda)',
        school: 'Delhi Public School',
        category: 'Boys Uniform',
        size: '30',
        price: 550,
        qty: 2,
        itemTotal: 1100,
        imageSrc: '/prod-shirt.jpg'
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        name: 'Grey Formal Trousers',
        school: 'Delhi Public School',
        category: 'Boys Uniform',
        size: '32',
        price: 650,
        qty: 1,
        itemTotal: 650,
        imageSrc: '/prod-pant.jpg'
      }
    ],
    itemsCount: 3,
    subtotal: 1750,
    deliveryFee: 0,
    totalAmount: 1750,
    status: 'pending',
    deliveryTime: '',
    adminNotes: '',
    declineReason: '',
    userCompleted: false,
    userCompletedAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'BS-1023',
    orderNumber: '#BS1023',
    customerName: 'Anita Desai',
    customerMobile: '+91 98123 45678',
    customerEmail: 'anita.desai@example.com',
    deliveryAddress: {
      address1: 'Flat 302, Green Avenue',
      address2: 'Civil Lines',
      city: 'Bathinda',
      state: 'Punjab',
      postal: '151002'
    },
    school: "St. Xavier's High",
    items: [
      {
        id: 'item-3',
        productId: 'prod-3',
        name: "Girls Pleated Dark Skirt",
        school: "St. Xavier's High",
        category: "Girls Uniform",
        size: '28',
        price: 600,
        qty: 2,
        itemTotal: 1200,
        imageSrc: '/prod-skirt.jpg'
      }
    ],
    itemsCount: 2,
    subtotal: 1200,
    deliveryFee: 0,
    totalAmount: 1200,
    status: 'accepted',
    deliveryTime: 'Today by 5:30 PM',
    adminNotes: 'Uniform prepared and packaged.',
    declineReason: '',
    userCompleted: false,
    userCompletedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 72000000).toISOString()
  }
];

function mapFromDb(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    orderNumber: row.order_number || row.orderNumber || row.id,
    customerName: row.customer_name || row.customerName,
    customerMobile: row.customer_mobile || row.customerMobile,
    customerEmail: row.customer_email || row.customerEmail || '',
    deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : (row.delivery_address || row.deliveryAddress || {}),
    school: row.school || 'General School',
    items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [],
    itemsCount: Number(row.items_count || row.itemsCount || 1),
    subtotal: Number(row.subtotal || 0),
    deliveryFee: Number(row.delivery_fee || row.deliveryFee || 0),
    totalAmount: Number(row.total_amount || row.totalAmount || 0),
    status: row.status || 'pending',
    deliveryTime: row.delivery_time || row.deliveryTime || '',
    adminNotes: row.admin_notes || row.adminNotes || '',
    declineReason: row.declinereason || row.decline_reason || row.declineReason || '',
    userCompleted: Boolean(row.user_completed || row.userCompleted),
    userCompletedAt: row.user_completed_at || row.userCompletedAt || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function applySequentialSeries(orders) {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const sortedChronological = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  const seriesMap = new Map();
  sortedChronological.forEach((o, index) => {
    const seriesNo = index + 1;
    seriesMap.set(String(o.id), seriesNo);
  });

  return orders.map((o) => {
    const seriesNo = seriesMap.get(String(o.id)) || 1;
    const sequentialOrderNumber = `#${seriesNo}`;
    return {
      ...o,
      seriesNo,
      orderNumber: sequentialOrderNumber,
      rawOrderNumber: o.orderNumber || o.id
    };
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 1. Try Supabase query
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    let orders = [];

    if (!error && Array.isArray(data)) {
      if (data.length > 0) {
        orders = data.map(mapFromDb).filter(Boolean);
      } else {
        orders = [];
      }
    } else {
      orders = fallbackOrders;
    }

    orders = applySequentialSeries(orders);

    let filtered = orders;
    if (status && status !== 'All') {
      filtered = filtered.filter((o) => o.status?.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerMobile?.includes(q) ||
        o.school?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      orders: filtered
    });
  } catch (err) {
    const sequenced = applySequentialSeries(fallbackOrders);
    return NextResponse.json({
      success: true,
      count: sequenced.length,
      orders: sequenced
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerMobile, deliveryAddress, items } = body;

    if (!customerName || !customerMobile || !deliveryAddress || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: customerName, customerMobile, deliveryAddress, items'
        },
        { status: 400 }
      );
    }

    // Determine sequential sequence number
    let nextSeq = 1;
    try {
      const { data: existing } = await supabase.from('orders').select('id');
      nextSeq = (existing && existing.length > 0) ? existing.length + 1 : (fallbackOrders.length + 1);
    } catch (e) {
      nextSeq = fallbackOrders.length + 1;
    }

    const orderId = body.id || `BS-${nextSeq}`;
    const orderNumber = `#${nextSeq}`;
    const subtotal = Number(body.subtotal ?? items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0));
    const deliveryFee = Number(body.deliveryFee ?? 0);
    const totalAmount = Number(body.totalAmount ?? (subtotal + deliveryFee));
    const itemsCount = items.reduce((sum, item) => sum + Number(item.qty || 1), 0);

    const newOrder = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_mobile: customerMobile,
      customer_email: body.customerEmail || '',
      delivery_address: deliveryAddress,
      school: body.school || items[0]?.school || 'General School',
      items: items,
      items_count: itemsCount,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      status: 'pending',
      delivery_time: '',
      admin_notes: '',
      declinereason: '',
      user_completed: false,
      user_completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try inserting into Supabase
    try {
      const { error: insertError } = await supabase.from('orders').insert([newOrder]);
      if (insertError) {
        console.error('Supabase order insert error:', insertError.message || insertError);
      }
    } catch (e) {
      console.error('Exception inserting order to Supabase:', e);
    }

    // Try creating notification
    try {
      await supabase.from('notifications').insert([{
        id: `notif-${Date.now()}`,
        order_id: orderId,
        type: 'order_created',
        title: '🔔 New Uniform Order Placed!',
        message: `Order ${orderNumber} placed by ${customerName} (₹${totalAmount})`,
        target_role: 'all',
        customer_mobile: customerMobile,
        read: false,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {}

    const formatted = {
      ...mapFromDb(newOrder),
      seriesNo: nextSeq,
      orderNumber
    };
    fallbackOrders.unshift(formatted);

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: formatted
    }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/orders:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to process order' },
      { status: 500 }
    );
  }
}
