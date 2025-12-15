import { gql } from '@apollo/client';

// Report Mutations
export const CREATE_ARRIVAL_REPORT = gql`
  mutation CreateArrivalReport($scheduleId: String!) {
    createReport(scheduleId: $scheduleId, status: "arrival", currentStep: 3) {
      id
      scheduleId
      userId
      status
      currentStep
      createdAt
    }
  }
`;

export const CREATE_WAKEUP_REPORT = gql`
  mutation CreateWakeupReport($scheduleId: String!, $estimatedTime: String) {
    createReport(
      scheduleId: $scheduleId
      status: "wakeup"
      estimatedTime: $estimatedTime
      currentStep: 1
    ) {
      id
      scheduleId
      userId
      status
      currentStep
      estimatedTime
      createdAt
    }
  }
`;

export const CREATE_DEPARTURE_REPORT = gql`
  mutation CreateDepartureReport($scheduleId: String!, $estimatedTime: String) {
    createReport(
      scheduleId: $scheduleId
      status: "departure"
      estimatedTime: $estimatedTime
      currentStep: 2
    ) {
      id
      scheduleId
      userId
      status
      currentStep
      estimatedTime
      createdAt
    }
  }
`;

export const CREATE_COMPLETED_REPORT = gql`
  mutation CreateCompletedReport($scheduleId: String!, $memo: String) {
    createReport(
      scheduleId: $scheduleId
      status: "completed"
      currentStep: 3
      memo: $memo
    ) {
      id
      scheduleId
      userId
      status
      currentStep
      memo
      createdAt
    }
  }
`;

// Report Queries
export const GET_REPORTS_BY_SCHEDULE = gql`
  query GetReportsBySchedule($scheduleId: String!) {
    reportsBySchedule(scheduleId: $scheduleId) {
      id
      scheduleId
      userId
      status
      estimatedTime
      currentStep
      memo
      createdAt
      updatedAt
    }
  }
`;

// Report Mutations for Updates
export const UPDATE_DEPARTURE_REPORT = gql`
  mutation UpdateDepartureReport($id: String!, $estimatedTime: String) {
    updateReport(
      id: $id
      status: "departure"
      estimatedTime: $estimatedTime
      currentStep: 2
    ) {
      id
      scheduleId
      userId
      status
      estimatedTime
      currentStep
      updatedAt
    }
  }
`;

export const UPDATE_ARRIVAL_REPORT = gql`
  mutation UpdateArrivalReport($id: String!) {
    updateReport(id: $id, status: "arrival", currentStep: 3) {
      id
      scheduleId
      userId
      status
      currentStep
      updatedAt
    }
  }
`;

export const UPDATE_COMPLETED_REPORT = gql`
  mutation UpdateCompletedReport($id: String!, $memo: String) {
    updateReport(id: $id, status: "completed", currentStep: 3, memo: $memo) {
      id
      scheduleId
      userId
      status
      currentStep
      memo
      updatedAt
    }
  }
`;
