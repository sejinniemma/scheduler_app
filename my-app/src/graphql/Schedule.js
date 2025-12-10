// Schedule Queries
export const GET_SCHEDULES = gql`
  query GetSchedules {
    schedules {
      id
      groom
      bride
      date
      location
      memo
      status
      currentStep
      createdAt
    }
  }
`;

export const GET_SCHEDULE = gql`
  query GetSchedule($id: ID!) {
    schedule(id: $id) {
      id
      groom
      bride
      date
      location
      memo
      status
      currentStep
      createdAt
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
    $id: ID!
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
