import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createToken } from '@/lib/auth';

const schema = z.object({
  user_json_url: z.string().url(),
});

// Use fetch instead of https module for Vercel Edge compatibility
async function fetchUserData(url: string): Promise<{
  user_country_code: string;
  user_phone_number: string;
  user_first_name?: string;
  user_last_name?: string;
}> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_json_url } = schema.parse(body);

    const userData = await fetchUserData(user_json_url);
    const { user_country_code, user_phone_number } = userData;
    const fullPhone = `${user_country_code}${user_phone_number}`;

    console.log('✅ Phone verified:', fullPhone);

    const token = await createToken({ 
      phone: fullPhone, 
      userId: 'temp' 
    });

    const res = NextResponse.json({ 
      success: true,
      phone: fullPhone,
    });

    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400,
      sameSite: 'lax',
      path: '/',
    });

    res.cookies.set('temp_phone', fullPhone, {
      httpOnly: false,
      maxAge: 3600,
      sameSite: 'lax',
      path: '/',
    });

    if (userData.user_first_name) {
      const fullName = `${userData.user_first_name} ${userData.user_last_name || ''}`.trim();
      res.cookies.set('temp_name', fullName, {
        httpOnly: false,
        maxAge: 3600,
        sameSite: 'lax',
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Phone verification failed' },
      { status: 400 }
    );
  }
}
