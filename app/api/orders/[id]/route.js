import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { clearProductsCache } from '@/app/api/products/route';

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

      // 🔥 RESTORE STOCK ON DECLINE: Add stock back for each product in the order
      if (!isAccepted && updatedOrder) {
        try {
          const orderItems = updatedOrder.items || [];
          if (Array.isArray(orderItems) && orderItems.length > 0) {
            for (const item of orderItems) {
              const productId = String(item.productId || item.id || '');
              if (!productId) continue;
              const size = String(item.size || '');
              const qty = Number(item.qty || 1);

              const { data: product } = await supabase
                .from('products')
                .select('id, name, stock_quantity, size_stocks')
                .eq('id', productId)
                .maybeSingle();

              if (product) {
                const currentStock = Number(product.stock_quantity ?? 0);
                const newStockQuantity = currentStock + qty;
                let currentSizeStocks = product.size_stocks || {};
                if (typeof currentSizeStocks === 'string') {
                  try { currentSizeStocks = JSON.parse(currentSizeStocks); } catch (e) { currentSizeStocks = {}; }
                }
                const newSizeStocks = { ...currentSizeStocks };
                if (size) {
                  newSizeStocks[size] = (Number(newSizeStocks[size] ?? 0)) + qty;
                }

                await supabase
                  .from('products')
                  .update({
                    stock_quantity: newStockQuantity,
                    size_stocks: newSizeStocks,
                    in_stock: newStockQuantity > 0,
                  })
                  .eq('id', productId);

                console.log(`♻️ Stock restored for "${product.name}": ${currentStock} → ${newStockQuantity} (+${qty})`);
              }
            }
            clearProductsCache();
          }
        } catch (stockErr) {
          console.error('❌ Stock restoration error on decline:', stockErr.message || stockErr);
        }
      }

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
