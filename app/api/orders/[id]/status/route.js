import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, deliveryTime, adminNotes, declineReason } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    const updatePayload = {
      status,
      updated_at: new Date().toISOString()
    };
    if (deliveryTime !== undefined) updatePayload.delivery_time = deliveryTime;
    if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;
    if (declineReason !== undefined) updatePayload.declinereason = declineReason;

    // 1. Update in Supabase
    let updatedOrder = null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedOrder = mapFromDb(data);
      } else if (error) {
        console.error('Error updating order status in Supabase:', error);
      }
    } catch (e) {
      console.error('Exception updating order in Supabase:', e);
    }

    if (!updatedOrder) {
      updatedOrder = {
        id,
        orderNumber: `#${String(id).replace('-', '')}`,
        status,
        deliveryTime: deliveryTime || '',
        adminNotes: adminNotes || '',
        declineReason: declineReason || '',
        updatedAt: new Date().toISOString()
      };
    }

    // 2. Insert notification into Supabase for website user & admin
    const isAccepted = status === 'accepted';
    try {
      const notifId = `notif-${Date.now()}`;
      await supabase.from('notifications').insert([{
        id: notifId,
        order_id: updatedOrder.id,
        type: isAccepted ? 'order_accepted' : 'order_declined',
        title: isAccepted ? '🎉 Uniform Order Accepted!' : '⚠️ Uniform Order Declined',
        message: isAccepted
          ? `Order ${updatedOrder.orderNumber || updatedOrder.id} has been accepted! Expected Delivery: ${deliveryTime || 'As scheduled'}`
          : `Order ${updatedOrder.orderNumber || updatedOrder.id} could not be accepted. Reason: ${declineReason || 'Item unavailable'}`,
        target_role: 'all',
        customer_mobile: updatedOrder.customerMobile || '',
        read: false,
        created_at: new Date().toISOString()
      }]);
    } catch (notifErr) {
      console.error('Failed to create notification in Supabase:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error in PUT /api/orders/[id]/status:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
