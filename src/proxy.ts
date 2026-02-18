import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const proxy = withAuth(
  function proxyHandler(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 로그인된 사용자가 로그인 페이지에 접근하면 메인(/)으로
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === '/login') {
          return true;
        }
        return !!token;
      },
    },
  }
);

export default proxy;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};
