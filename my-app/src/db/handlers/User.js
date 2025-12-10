import { gql } from '@apollo/client';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    phone: String!
    role: String!
    tenantId: String!
    createdAt: String!
  }

  type Query {
    me: User
    users: [User!]!
  }

  type Mutation {
    createUser(
      name: String!
      phone: String!
      tenantId: String!
      role: String
    ): User!
    updateUser(id: ID!, name: String, phone: String): User!
    deleteUser(id: ID!): Boolean!
  }
`;

import { User } from '../models/User';
import { Schedule } from '../models/Schedule';
import { connectToDatabase } from '../db/mongodb';

export const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      return await User.findById(context.user.id);
    },

    users: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      // 멀티테넌트: 같은 tenantId의 사용자만 조회
      return await User.find({ tenantId: context.user.tenantId });
    },

    schedules: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      // 멀티테넌트: 같은 tenantId의 스케줄만 조회
      return await Schedule.find({ tenantId: context.user.tenantId });
    },

    schedule: async (parent, { id }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = await Schedule.findById(id);
      // 멀티테넌트: 같은 tenantId인지 확인
      if (schedule && schedule.tenantId !== context.user.tenantId) {
        throw new Error('권한이 없습니다.');
      }
      return schedule;
    },
  },

  Mutation: {
    createUser: async (
      parent,
      { name, phone, tenantId, role = 'PHOTOGRAPHER' },
      context
    ) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('관리자 권한이 필요합니다.');
      }
      await connectToDatabase();
      const user = new User({ name, phone, tenantId, role });
      return await user.save();
    },

    updateUser: async (parent, { id, name, phone }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const user = await User.findById(id);
      if (!user || user.tenantId !== context.user.tenantId) {
        throw new Error('권한이 없습니다.');
      }
      if (name) user.name = name;
      if (phone) user.phone = phone;
      return await user.save();
    },

    deleteUser: async (parent, { id }, context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('관리자 권한이 필요합니다.');
      }
      await connectToDatabase();
      const user = await User.findById(id);
      if (user && user.tenantId === context.user.tenantId) {
        await User.findByIdAndDelete(id);
        return true;
      }
      return false;
    },
  },
};
