import { getToken } from 'next-auth/jwt';

export default async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;

  // 로그인 페이지는 인증 없이 접근 가능
  if (pathname === '/') {
    return;
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return Response.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청 경로와 일치:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
