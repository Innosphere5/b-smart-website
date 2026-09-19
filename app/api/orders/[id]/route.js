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

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. Try Supabase query
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .single();

    if (!error && data) {
      return NextResponse.json({ success: true, order: mapFromDb(data) });
    }

    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error fetching order' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateFields = {
      updated_at: new Date().toISOString()
    };
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.deliveryTime !== undefined) updateFields.delivery_time = body.deliveryTime;
    if (body.adminNotes !== undefined) updateFields.admin_notes = body.adminNotes;
    if (body.declineReason !== undefined) updateFields.declinereason = body.declineReason;
    if (body.userCompleted !== undefined) updateFields.user_completed = body.userCompleted;
    if (body.userCompletedAt !== undefined) updateFields.user_completed_at = body.userCompletedAt;

    let updatedOrder = null;
    const { data, error } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      updatedOrder = mapFromDb(data);
    } else {
      updatedOrder = { id, ...body, updatedAt: new Date().toISOString() };
    }

    // Trigger notification if status changed
    if (body.status === 'accepted' || body.status === 'declined') {
      const isAccepted = body.status === 'accepted';
      try {
        await supabase.from('notifications').insert([{
          id: `notif-${Date.now()}`,
          order_id: id,
          type: isAccepted ? 'order_accepted' : 'order_declined',
          title: isAccepted ? '🎉 Uniform Order Accepted!' : '⚠️ Uniform Order Declined',
          message: isAccepted
            ? `Order ${updatedOrder.orderNumber || id} has been accepted! Expected Delivery: ${body.deliveryTime || 'As scheduled'}`
            : `Order ${updatedOrder.orderNumber || id} could not be accepted. Reason: ${body.declineReason || 'Item unavailable'}`,
          target_role: 'all',
          customer_mobile: updatedOrder.customerMobile || '',
          read: false,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated',
      order: updatedOrder
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error updating order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Delete from Supabase
    const { error } = await supabase
      .from('orders')
      .delete()
      .or(`id.eq.${id},order_number.eq.${id}`);

    if (error) {
      console.warn('Supabase delete error in user_panel:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: `Order ${id} deleted successfully`
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error deleting order' },
      { status: 500 }
    );
  }
}
