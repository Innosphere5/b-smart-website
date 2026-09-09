import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'http://localhost:5000';

function mapFromDb(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    orderNumber: row.order_number || row.orderNumber || row.id,
    customerName: row.customer_name || row.customerName || 'Valued Customer',
    customerMobile: row.customer_mobile || row.customerMobile || '',
    customerEmail: row.customer_email || row.customerEmail || '',
    deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : (row.delivery_address || {}),
    school: row.school || 'General School',
    items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [],
    itemsCount: Number(row.items_count || 1),
    subtotal: Number(row.subtotal || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    totalAmount: Number(row.total_amount || 0),
    status: row.status || 'pending',
    deliveryTime: row.delivery_time || '',
    adminNotes: row.admin_notes || '',
    declineReason: row.declinereason || row.decline_reason || '',
    createdAt: row.created_at || new Date().toISOString()
  };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. If Express backend running on port 5000, stream the binary PDF
    if (EXPRESS_BACKEND_URL) {
      try {
        const res = await fetch(`${EXPRESS_BACKEND_URL}/api/orders/${id}/pdf`, { cache: 'no-store' });
        if (res.ok) {
          const pdfBuffer = await res.arrayBuffer();
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="bsmart_invoice_${id}.pdf"`
            }
          });
        }
      } catch (e) {
        // Fallback to high-definition printable HTML invoice
      }
    }

    // 2. Fetch real order from Supabase
    let order = null;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id},order_number.eq.${id}`)
        .single();

      if (!error && data) {
        order = mapFromDb(data);
      }
    } catch (e) {}

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found for PDF invoice' }, { status: 404 });
    }

    const addr = typeof order.deliveryAddress === 'object' && order.deliveryAddress !== null
      ? `${order.deliveryAddress.address1 || ''} ${order.deliveryAddress.address2 || ''}, ${order.deliveryAddress.city || ''} ${order.deliveryAddress.state || ''} - ${order.deliveryAddress.postal || ''}`
      : (order.deliveryAddress || 'Standard Home Delivery');

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHtml = (order.items || []).map((item, idx) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; font-weight: 700; color: #1F2937;">
          ${item.name}
          <div style="font-size: 11px; color: #6B7280; font-weight: 400;">Category: ${item.category || 'Uniform'}</div>
        </td>
        <td style="padding: 12px; color: #4B5563;">${item.school || order.school}</td>
        <td style="padding: 12px; font-weight: 700; color: #881337; text-align: center;">${item.size || 'Standard'}</td>
        <td style="padding: 12px; text-align: right; color: #1F2937;">₹${Number(item.price || 0)}</td>
        <td style="padding: 12px; text-align: center; font-weight: 700;">${Number(item.qty || 1)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 800; color: #881337;">₹${(Number(item.price || 0) * Number(item.qty || 1))}</td>
      </tr>
    `).join('');

    const statusUpper = (order.status || 'PENDING').toUpperCase();
    const statusBg = statusUpper === 'ACCEPTED' ? '#DBEAFE' : statusUpper === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7';
    const statusColor = statusUpper === 'ACCEPTED' ? '#1E40AF' : statusUpper === 'COMPLETED' ? '#065F46' : '#92400E';

    // HTML fallback invoice printable view with complete real credentials
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>B'Smart Order Invoice - ${order.orderNumber || order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1F2937; max-width: 850px; margin: auto; background: #FFF; }
          .top-brand-bar { height: 8px; background: #881337; margin: -30px -30px 24px -30px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #FCD34D; padding-bottom: 20px; }
          .store-name { font-size: 26px; font-weight: 900; color: #881337; letter-spacing: -0.5px; }
          .store-sub { font-size: 10px; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
          .store-meta { font-size: 11px; color: #6B7280; margin-top: 6px; line-height: 1.4; }
          .invoice-box { background: #FEFCE8; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 14px 18px; text-align: right; }
          .invoice-title { font-size: 14px; font-weight: 900; color: #881337; }
          .invoice-no { font-size: 12px; font-weight: 800; color: #1F2937; margin-top: 4px; }
          .invoice-date { font-size: 11px; color: #4B5563; margin-top: 2px; }
          .status-badge { display: inline-block; margin-top: 8px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; background: ${statusBg}; color: ${statusColor}; }
          .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
          .info-card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 14px; }
          .info-card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #7F1D1D; border-bottom: 1px dashed #E5E7EB; padding-bottom: 6px; margin-bottom: 8px; }
          .info-line { font-size: 12px; margin-bottom: 4px; color: #374151; }
          .table-title { font-size: 13px; font-weight: 800; color: #881337; margin-top: 28px; margin-bottom: 10px; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #881337; color: #FFFFFF; text-align: left; padding: 10px 12px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
          .totals-wrap { margin-top: 20px; display: flex; justify-content: flex-end; }
          .totals-table { width: 280px; font-size: 12px; }
          .totals-table td { padding: 6px 10px; }
          .grand-total { font-size: 15px; font-weight: 900; color: #881337; border-top: 2px solid #881337; border-bottom: 2px solid #881337; }
          .btn-print { background: #881337; color: #FFFFFF; border: none; padding: 10px 22px; font-size: 13px; font-weight: 800; border-radius: 8px; cursor: pointer; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .btn-print:hover { background: #7F1D1D; }
          @media print { .btn-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="top-brand-bar"></div>
        <button class="btn-print" onclick="window.print()">🖨️ Print Invoice / Save as PDF</button>

        <div class="header">
          <div>
            <div class="store-name">B'SMART DRESSES</div>
            <div class="store-sub">Premium School Uniforms & Accessories</div>
            <div class="store-meta">
              GSTIN: 03ANXPG2252L1ZS | Ph: +91 98765-43210<br>
              #MCB-Z304654, Dr. Mela Ram Hospital Road, Bathinda (Punjab)
            </div>
          </div>
          <div class="invoice-box">
            <div class="invoice-title">OFFICIAL INVOICE</div>
            <div class="invoice-no">${order.orderNumber || order.id}</div>
            <div class="invoice-date">Date: ${formattedDate}</div>
            <div class="status-badge">STATUS: ${statusUpper}</div>
          </div>
        </div>

        <div class="cards-grid">
          <div class="info-card" style="background: #FFFDF5; border-color: #FDE68A;">
            <div class="info-card-title">Customer Credentials</div>
            <div class="info-line"><strong>Name:</strong> ${order.customerName}</div>
            <div class="info-line"><strong>Mobile:</strong> ${order.customerMobile || 'N/A'}</div>
            <div class="info-line"><strong>Email:</strong> ${order.customerEmail || 'N/A'}</div>
            <div class="info-line"><strong>School:</strong> ${order.school || 'General School'}</div>
          </div>

          <div class="info-card" style="background: #F0FDF4; border-color: #BBF7D0;">
            <div class="info-card-title" style="color: #065F46;">Delivery Destination</div>
            <div class="info-line"><strong>Address:</strong> ${addr}</div>
            <div class="info-line" style="margin-top: 8px;">
              <strong>Scheduled Delivery:</strong> 
              <span style="color: #1E40AF; font-weight: 800;">${order.deliveryTime || 'Awaiting Admin Schedule'}</span>
            </div>
          </div>
        </div>

        <div class="table-title">Ordered Items & Size Specifications</div>
        <table>
          <thead>
            <tr>
              <th>Item & Category</th>
              <th>School</th>
              <th style="text-align: center;">Size</th>
              <th style="text-align: right;">Rate (INR)</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-wrap">
          <table class="totals-table">
            <tr>
              <td style="color: #6B7280;">Subtotal:</td>
              <td style="text-align: right; font-weight: 700;">₹${order.subtotal || order.totalAmount}</td>
            </tr>
            <tr>
              <td style="color: #6B7280;">Delivery Charge:</td>
              <td style="text-align: right; font-weight: 700;">${Number(order.deliveryFee) === 0 ? 'FREE' : `₹${order.deliveryFee}`}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td style="text-align: right;">₹${order.totalAmount}</td>
            </tr>
          </table>
        </div>

        ${order.adminNotes ? `
          <div style="margin-top: 24px; padding: 12px; background: #F3F4F6; border-radius: 8px; font-size: 11px; color: #4B5563;">
            <strong>Order Notes:</strong> ${order.adminNotes}
          </div>
        ` : ''}

        <div style="margin-top: 36px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          Thank you for shopping with B'Smart Dresses. For exchange or delivery inquiries, call +91 98765-43210.
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (err) {
    console.error('Error generating order invoice:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error generating invoice' },
      { status: 500 }
    );
  }
}
