import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    //const supportedLocales = ['en', 'zh'];
    const { pathname } = request.nextUrl;
    // Only redirect if at root ("/") and not already at a locale
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/en', request.url));
    }
    // Do NOT redirect if already at /en, /zh, or any other path
    return NextResponse.next();
}
