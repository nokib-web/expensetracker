import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/register');
        const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard') ||
            req.nextUrl.pathname.startsWith('/transactions') ||
            req.nextUrl.pathname.startsWith('/zakat');

        // Redirect authenticated users away from auth pages
        if (isAuthPage && isAuth) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Redirect unauthenticated users to login
        if (isProtectedPage && !isAuth) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true, // We handle authorization in the middleware function
        },
        pages: {
            signIn: '/login',
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/transactions/:path*', '/zakat/:path*', '/login', '/register'],
};

