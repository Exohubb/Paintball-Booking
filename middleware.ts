import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis for production multi-instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5;
const WINDOW_MS = 30000; // 30 seconds
const BLOCK_MS = 30000; // 30 seconds block

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(key);
  }

  const current = rateLimitMap.get(key);

  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (current.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - current.count };
}

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(key);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 30 seconds.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Date.now() + BLOCK_MS + '',
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
