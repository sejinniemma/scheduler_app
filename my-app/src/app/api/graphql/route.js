import { connectToDatabase } from '@/db/mongodb';
import { ApolloServer } from '@apollo/server';
import { GraphQLDateTime } from 'graphql-iso-date';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs as UserTypeDefs } from '@/db/handlers/User';
import { typeDefs as ScheduleTypeDefs } from '@/db/handlers/Schedule';
import { resolvers as UserResolvers } from '@/db/handlers/User';
import { resolvers as ScheduleResolvers } from '@/db/handlers/Schedule';

export const dynamic = 'force-dynamic'; // ✅ 꼭 필요!

// DateTime 타입 따로 정의
const dateTimeResolver = {
  DateTime: GraphQLDateTime,
};

// MongoDB 연결
const db = await connectToDatabase(); // 한 번만 호출하여 연결을 재사용

// 모든 typDefs,resolvers 병합
const typeDefs = [UserTypeDefs, ScheduleTypeDefs];
const resolvers = [dateTimeResolver, UserResolvers, ScheduleResolvers];

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
    const db = await connectToDatabase();
    return { db };
  },
});

export { handler as GET, handler as POST };
