import Schedule from '../models/Schedule';
import Report from '../models/Report';
import User from '../models/User';
import { connectToDatabase } from '../mongodb';
import { gql } from '@apollo/client';
import { getToday } from '@/src/lib/utiles';

export const typeDefs = gql`
  scalar DateTime

  type Schedule {
    id: String!
    mainUser: String!
    subUser: String
    groom: String!
    bride: String!
    date: String!
    time: String!
    scheduledAt: DateTime
    location: String
    venue: String
    memo: String
    status: String!
    currentStep: Int
    reportStatus: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    getTodaySchedules: [Schedule!]!
    schedule(id: ID!): Schedule
  }

  type Mutation {
    createSchedule(
      mainUser: String!
      subUser: String
      groom: String!
      bride: String!
      date: String!
      time: String!
      location: String
      venue: String
      memo: String
      status: String
    ): Schedule!

    updateSchedule(
      id: String!
      mainUser: String
      subUser: ID
      groom: String
      bride: String
      date: String
      time: String
      location: String
      venue: String
      memo: String
      status: String
    ): Schedule!

    confirmSchedules(scheduleIds: [String!]!): ConfirmSchedulesResult!

    deleteSchedule(id: String!): Boolean!
  }

  type ConfirmSchedulesResult {
    success: Boolean!
    updatedCount: Int!
  }
`;

export const resolvers = {
  Query: {
    getTodaySchedules: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();

      // 오늘 날짜 가져오기
      const today = getToday();

      // 기본 쿼리: 로그인한 사용자가 mainUser 또는 subUser인 스케줄만 조회
      // 오늘 날짜이고 확정된 스케줄만 조회
      const query = {
        $or: [{ mainUser: context.user.id }, { subUser: context.user.id }],
        date: today,
        status: 'confirmed',
      };

      const schedules = await Schedule.find(query);

      // scheduledAt 기준 정렬 (더 빠른 시간이 앞에)
      const sortedSchedules = schedules.sort((a, b) => {
        return a.date - b.date;
      });

      // User 찾기 (Report 조회를 위해)
      const user = await User.findOne({ id: context.user.id });
      if (!user) {
        return sortedSchedules.map((schedule) => ({
          ...schedule.toObject(),
          currentStep: 0,
          reportStatus: null,
        }));
      }

      // 각 스케줄에 대한 Report의 currentStep과 status 가져오기
      const schedulesWithReport = await Promise.all(
        sortedSchedules.map(async (schedule) => {
          const report = await Report.findOne({
            scheduleId: schedule.id,
            userId: user.id,
          });

          return {
            ...schedule.toObject(),
            currentStep: report?.currentStep ?? 0,
            // Report의 status를 사용 (없으면 null)
            reportStatus: report?.status || null,
          };
        })
      );
      console.log('schedulesWithReport', schedulesWithReport);
      const withOutCompleted = schedulesWithReport.filter(
        (schedule) => schedule.reportStatus !== 'completed'
      );
      return withOutCompleted;
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
        schedule.mainUser !== context.user.id &&
        schedule.subUser !== context.user.id
      ) {
        throw new Error('권한이 없습니다.');
      }

      // 현재 사용자의 Report 정보 추가
      const user = await User.findOne({ id: context.user.id });
      if (user) {
        const report = await Report.findOne({
          scheduleId: schedule.id,
          userId: user.id,
        });

        return {
          ...schedule.toObject(),
          currentStep: report?.currentStep ?? 0,
          reportStatus: report?.status || null,
        };
      }

      return {
        ...schedule.toObject(),
        currentStep: 0,
        reportStatus: null,
      };
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
        venue,
        memo,
        status = 'unassigned',
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
        venue,
        memo,
        status,
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
        schedule.mainUser !== context.user.id &&
        schedule.subUser !== context.user.id
      ) {
        throw new Error('권한이 없습니다.');
      }
      Object.assign(schedule, updates);
      return await schedule.save();
    },

    confirmSchedules: async (parent, { scheduleIds }, context) => {
      if (!context.user) {
        throw new Error('인증이 필요합니다.');
      }
      await connectToDatabase();

      if (!scheduleIds || scheduleIds.length === 0) {
        throw new Error('스케줄 ID 배열이 필요합니다.');
      }

      // 모든 스케줄을 찾아서 권한 확인 및 업데이트
      const schedules = await Schedule.find({ id: { $in: scheduleIds } });

      if (schedules.length === 0) {
        throw new Error('스케줄을 찾을 수 없습니다.');
      }

      // 권한 확인 및 업데이트 (assigned인 것만)
      let updatedCount = 0;
      for (const schedule of schedules) {
        // 본인이 mainUser 또는 subUser인지 확인
        if (
          schedule.mainUser !== context.user.id &&
          schedule.subUser !== context.user.id
        ) {
          continue; // 권한이 없는 스케줄은 건너뛰기
        }

        // status가 'assigned'인 것만 업데이트
        if (schedule.status === 'assigned') {
          schedule.status = 'confirmed';
          await schedule.save();
          updatedCount++;
        }
      }

      return {
        success: true,
        updatedCount,
      };
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
        schedule.mainUser === context.user.id ||
        schedule.subUser === context.user.id
      ) {
        await Schedule.findOneAndDelete({ id });
        return true;
      }
      return false;
    },
  },
};
