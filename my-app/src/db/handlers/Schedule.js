import { Schedule } from '../models/Schedule';
import { connectToDatabase } from '../db/mongodb';
import { gql } from '@apollo/client';

export const typeDefs = gql`
  type Schedule {
    id: ID
    groom: String!
    bride: String!
    date: String!
    location: String
    memo: String
    status: String!
    currentStep: Int!
    createdAt: String!
  }

  type Query {
    schedules: [Schedule!]!
    schedule(id: ID!): Schedule
  }

  type Mutation {
    createSchedule(
      groom: String!
      bride: String!
      date: String!
      location: String
      memo: String
    ): Schedule!

    updateSchedule(
      id: ID!
      groom: String
      bride: String
      date: String
      location: String
      memo: String
      status: String
      currentStep: Int
    ): Schedule!

    deleteSchedule(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
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
    createSchedule: async (
      parent,
      { groom, bride, date, location, memo },
      context
    ) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = new Schedule({
        groom,
        bride,
        date,
        location,
        memo,
        tenantId: context.user.tenantId,
        status: 'pending',
        currentStep: 0,
      });
      return await schedule.save();
    },

    updateSchedule: async (parent, { id, ...updates }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = await Schedule.findById(id);
      if (!schedule || schedule.tenantId !== context.user.tenantId) {
        throw new Error('권한이 없습니다.');
      }
      Object.assign(schedule, updates);
      return await schedule.save();
    },

    deleteSchedule: async (parent, { id }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = await Schedule.findById(id);
      if (schedule && schedule.tenantId === context.user.tenantId) {
        await Schedule.findByIdAndDelete(id);
        return true;
      }
      return false;
    },
  },
};
