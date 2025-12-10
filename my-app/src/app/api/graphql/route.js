import { connectToDatabase } from '../../../db/mongodb';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs as UserTypeDefs } from '../../../db/handlers/User';
import { typeDefs as ScheduleTypeDefs } from '../../../db/handlers/Schedule';
import { typeDefs as ReportTypeDefs } from '../../../db/handlers/Report';
import { resolvers as UserResolvers } from '../../../db/handlers/User';
import { resolvers as ScheduleResolvers } from '../../../db/handlers/Schedule';
import { resolvers as ReportResolvers } from '../../../db/handlers/Report';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic'; // ✅ 꼭 필요!

// MongoDB 연결
const db = await connectToDatabase(); // 한 번만 호출하여 연결을 재사용

// 모든 typDefs,resolvers 병합
const typeDefs = [UserTypeDefs, ScheduleTypeDefs, ReportTypeDefs];
const resolvers = [UserResolvers, ScheduleResolvers, ReportResolvers];

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { db }; // context에서 재사용
  },
  cors: {
    origin: ['http://localhost:3000'],
  },
});

const handler = startServerAndCreateNextHandler(server, {
  context: async () => {
    // MongoDB 연결
    const db = await connectToDatabase();

    // NextAuth 세션 가져오기
    const session = await getServerSession(authOptions);

    return {
      db,
      user: session?.user || null,
    };
  },
});

export { handler as GET, handler as POST };
