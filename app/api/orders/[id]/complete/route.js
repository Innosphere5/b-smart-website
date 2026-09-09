import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const now = new Date().toISOString();

    try {
      await supabase
        .from('orders')
        .update({
          user_completed: true,
          user_completed_at: now,
          updated_at: now
        })
        .eq('id', id);
    } catch (e) {
      // Supabase table fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Order marked as completed by customer',
      order: {
        id,
        userCompleted: true,
        userCompletedAt: now,
        updatedAt: now
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to complete order' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return PUT(request, context);
}
