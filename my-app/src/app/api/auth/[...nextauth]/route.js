import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '../../../../models/User';
import { connectToDatabase } from '../../../../db/mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: '이름', type: 'text' },
        phone: { label: '전화번호', type: 'text' },
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();

          const user = await User.findOne({
            phone: credentials?.phone,
          });

          if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
          }

          if (user.name !== credentials?.name) {
            throw new Error('이름이 일치하지 않습니다.');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            phone: user.phone,
            role: user.role,
            tenantId: user.tenantId,
          };
        } catch (error) {
          console.error('인증 오류:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
