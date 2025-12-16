import { gql } from '@apollo/client';

// Schedule Queries
export const GET_SCHEDULES = gql`
  query GetSchedules($date: String, $status: String) {
    schedules(date: $date, status: $status) {
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

// 오늘 스케줄 조회 쿼리
export const GET_TODAY_SCHEDULES = gql`
  query GetTodaySchedules($date: String!) {
    schedules(date: $date, status: "assigned") {
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
