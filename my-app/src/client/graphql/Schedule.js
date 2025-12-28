import { gql } from '@apollo/client';

// Schedule Queries
export const GET_SCHEDULES = gql`
  query GetSchedules {
    getTodaySchedules {
      id
      mainUser
      subUser
      groom
      bride
      time
      location
      venue
      date
      scheduledAt
      memo
      status
      currentStep
      reportStatus
      createdAt
      updatedAt
    }
  }
`;

// 오늘 스케줄 조회 쿼리 (GET_SCHEDULES와 동일하므로 별도로 유지하지 않아도 되지만, 호환성을 위해 유지)
export const GET_TODAY_SCHEDULES = gql`
  query GetTodaySchedules {
    getTodaySchedules {
      id
      mainUser
      subUser
      groom
      bride
      time
      location
      venue
      date
      scheduledAt
      memo
      status
      currentStep
      reportStatus
      createdAt
      updatedAt
    }
  }
`;

// Schedule Mutations
export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule(
    $groom: String!
    $bride: String!
    $date: String!
    $location: String
    $memo: String
  ) {
    createSchedule(
      groom: $groom
      bride: $bride
      date: $date
      location: $location
      memo: $memo
    ) {
      id
      groom
      bride
      date
      location
      memo
      status
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule(
    $id: String!
    $groom: String
    $bride: String
    $date: String
    $location: String
    $memo: String
    $status: String
  ) {
    updateSchedule(
      id: $id
      groom: $groom
      bride: $bride
      date: $date
      location: $location
      memo: $memo
      status: $status
    ) {
      id
      groom
      bride
      date
      location
      memo
      status
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id)
  }
`;

export const CONFIRM_SCHEDULES = gql`
  mutation ConfirmSchedules($scheduleIds: [ID!]!) {
    confirmSchedules(scheduleIds: $scheduleIds) {
      success
      updatedCount
    }
  }
`;
