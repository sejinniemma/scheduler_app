import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import type { NextAuthOptions } from 'next-auth';
import { GraphQLError } from 'graphql';
import { connectToDatabase } from '../db/mongodb';

import { typeDefs as UserTypeDefs } from '../db/handlers/User';
import { typeDefs as ScheduleTypeDefs } from '../db/handlers/Schedule';
import { resolvers as UserResolvers } from '../db/handlers/User';
import { resolvers as ScheduleResolvers } from '../db/handlers/Schedule';
import { typeDefs as ReportTypeDefs } from '../db/handlers/Report';
import { resolvers as ReportResolvers } from '../db/handlers/Report';

export const dynamic = 'force-dynamic'; // ✅ 꼭 필요!

// 모든 typDefs,resolvers 병합
const typeDefs = [UserTypeDefs, ScheduleTypeDefs, ReportTypeDefs];
const resolvers = [UserResolvers, ScheduleResolvers, ReportResolvers];

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async () => {
    await connectToDatabase();
    // NextAuth 세션 가져오기
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session?.user?.id) {
      throw new GraphQLError('인증이 필요합니다.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return {
      user: { id: session.user.id },
    };
  },
});

export async function GET(request: NextRequest): Promise<Response> {
  return handler(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return handler(request);
}
