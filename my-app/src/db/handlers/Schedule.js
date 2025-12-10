import Schedule from '../models/Schedule';
import { connectToDatabase } from '../mongodb';
import { gql } from '@apollo/client';

export const typeDefs = gql`
  scalar DateTime

  type Schedule {
    id: ID!
    mainUser: ID!
    subUser: ID!
    groom: String!
    bride: String!
    date: String!
    time: String!
    location: String
    memo: String
    status: String!
    subStatus: String!
    currentStep: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    schedules: [Schedule!]!
    schedule(id: ID!): Schedule
  }

  type Mutation {
    createSchedule(
      mainUser: ID!
      subUser: ID!
      groom: String!
      bride: String!
      date: String!
      time: String!
      location: String
      memo: String
      status: String
      subStatus: String
      currentStep: Int
    ): Schedule!

    updateSchedule(
      id: ID!
      mainUser: ID
      subUser: ID
      groom: String
      bride: String
      date: String
      time: String
      location: String
      memo: String
      status: String
      subStatus: String
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
      // 로그인한 사용자가 mainUser 또는 subUser인 스케줄만 조회
      return await Schedule.find({
        $or: [{ mainUser: context.user.id }, { subUser: context.user.id }],
      });
    },

    schedule: async (parent, { id }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        throw new Error('스케줄을 찾을 수 없습니다.');
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser.toString() !== context.user.id &&
        schedule.subUser.toString() !== context.user.id
      ) {
        throw new Error('권한이 없습니다.');
      }
      return schedule;
    },
  },

  Mutation: {
    createSchedule: async (
      parent,
      {
        mainUser,
        subUser,
        groom,
        bride,
        date,
        time,
        location,
        memo,
        status = 'pending',
        subStatus = 'unassigned',
        currentStep = 0,
      },
      context
    ) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = new Schedule({
        mainUser,
        subUser,
        groom,
        bride,
        date,
        time,
        location,
        memo,
        status,
        subStatus,
        currentStep,
      });
      return await schedule.save();
    },

    updateSchedule: async (parent, { id, ...updates }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        throw new Error('스케줄을 찾을 수 없습니다.');
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser.toString() !== context.user.id &&
        schedule.subUser.toString() !== context.user.id
      ) {
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
      const schedule = await Schedule.findOne({ id });
      if (!schedule) {
        return false;
      }
      // 본인이 mainUser 또는 subUser인지 확인
      if (
        schedule.mainUser.toString() === context.user.id ||
        schedule.subUser.toString() === context.user.id
      ) {
        await Schedule.findOneAndDelete({ id });
        return true;
      }
      return false;
    },
  },
};
