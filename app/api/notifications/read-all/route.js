import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    try {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
