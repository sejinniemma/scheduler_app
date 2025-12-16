import { gql } from '@apollo/client';

// Schedule Queries
export const GET_SCHEDULES = gql`
  query GetSchedules($date: String, $subStatus: String, $status: String) {
    schedules(date: $date, subStatus: $subStatus, status: $status) {
      id
      mainUser
      subUser
      groom
      bride
      time
      location
      venue
      date
      memo
      status
      subStatus
      currentStep
      createdAt
      updatedAt
    }
  }
`;

// 오늘 스케줄 조회 쿼리
export const GET_TODAY_SCHEDULES = gql`
  query GetTodaySchedules($date: String!) {
    schedules(date: $date, subStatus: "assigned") {
      id
      mainUser
      subUser
      groom
      bride
      time
      location
      venue
      date
      memo
      status
      subStatus
      currentStep
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
      currentStep
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
    $currentStep: Int
  ) {
    updateSchedule(
      id: $id
      groom: $groom
      bride: $bride
      date: $date
      location: $location
      memo: $memo
      status: $status
      currentStep: $currentStep
    ) {
      id
      groom
      bride
      date
      location
      memo
      status
      currentStep
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
