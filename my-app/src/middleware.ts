import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 로그인된 상태에서 루트 페이지(/)로 접근하면 메인 페이지로 리다이렉트
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/main', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // 루트 페이지(/)는 항상 접근 가능 (로그인 페이지)
        if (pathname === '/') {
          return true;
        }

        // 다른 페이지는 토큰이 있어야 접근 가능
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 경로와 일치:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};

