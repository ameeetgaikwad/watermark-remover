import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/api/gemini')) {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    console.log(`[${timestamp}] [ID: ${requestId}] Gemini API request: ${pathname}`);
    console.log(`[${timestamp}] [ID: ${requestId}] Method: ${request.method}`);
    console.log(`[${timestamp}] [ID: ${requestId}] User-Agent: ${request.headers.get('user-agent')}`);
    
    // Add request ID to headers for tracing
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-request-id', requestId);
    
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Add response handler for logging
    response.headers.set('x-request-id', requestId);
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 