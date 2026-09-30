import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { clearProductsCache } from '@/app/api/products/route';

/**
 * PUT /api/orders/:id/cancel - Cancel a pending order and restore stock
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const now = new Date().toISOString();

    // 1. Fetch the order to verify it exists and is pending
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.` },
        { status: 400 }
      );
    }

    // 2. Update order status to cancelled
    try {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: now
        })
        .eq('id', id);
    } catch (e) {
      console.error('Supabase cancel update error:', e);
    }

    // 3. 🔥 RESTORE STOCK: Add back the stock that was deducted when the order was placed
    const orderItems = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
    if (Array.isArray(orderItems) && orderItems.length > 0) {
      try {
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
      } catch (stockErr) {
        console.error('❌ Stock restoration error on cancel:', stockErr.message || stockErr);
      }
    }

    // 4. Create cancellation notification
    try {
      await supabase.from('notifications').insert([{
        id: `notif-cancel-${Date.now()}`,
        order_id: id,
        type: 'order_declined',
        title: '🚫 Order Cancelled by Customer',
        message: `Order ${order.order_number || id} was cancelled by customer`,
        target_role: 'all',
        customer_mobile: order.customer_mobile || '',
        read: false,
        created_at: now
      }]);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      order: {
        id,
        status: 'cancelled',
        updatedAt: now
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return PUT(request, context);
}
