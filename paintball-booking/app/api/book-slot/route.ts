import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  timeSlotId: z.string().uuid(),
  club: z.enum(['xploit', 'ecell']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { timeSlotId, club } = schema.parse(body);

    // Get auth_token from cookie
    const authToken = req.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login again' },
        { status: 401 }
      );
    }

    // Verify and decode JWT
    const payload = await verifyToken(authToken);
    
    if (!payload || !payload.phone) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const phone = payload.phone as string;

    const supabase = await createClient();

    // Get user ID from phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found. Please complete registration.' },
        { status: 404 }
      );
    }

    // Call the booking function
    const { data, error } = await supabase
      .rpc('book_slot', {
        p_user_id: user.id,
        p_time_slot_id: timeSlotId,
        p_club: club,
      });

    if (error || !data?.success) {
      return NextResponse.json(
        { error: data?.error || 'Booking failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
