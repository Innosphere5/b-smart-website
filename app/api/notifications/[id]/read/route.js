import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Notification marked as read', id });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
