import { gql } from '@apollo/client';
import User from '../models/User';
import { connectToDatabase } from '../mongodb';

/** DB 연결 후 fn 실행. export되는 함수에서 재사용 */
function withDb(fn) {
  return async (...args) => {
    await connectToDatabase();
    return fn(...args);
  };
}

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    name: String!
    phone: String!
    role: String!
    gender: String
    address: String
    mainLocation: String
    hasVehicle: Boolean
    startDate: DateTime
    birthDate: DateTime
    status: String
    memo: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type simpleResponse {
    success: Boolean!
    message: String
  }

  type Query {
    me: User
    users: [User!]!
  }

  type Mutation {
    createUser(
      name: String!
      phone: String!
      address: String
      mainLocation: String
      startDate: DateTime!
      role: String
      hasVehicle: Boolean
      birthDate: DateTime
      gender: String
      status: String
      memo: String
    ): User!

    updateUser(
      id: ID!
      name: String
      phone: String
      address: String
      mainLocation: String
      hasVehicle: Boolean
      startDate: DateTime
      gender: String
      status: String
      memo: String
    ): User!

    deleteUser(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    me: async (_, _args, context) => {
      return await User.findOne({ id: context.user.id });
    },

    users: async () => {
      return await User.find({});
    },
  },

  Mutation: {
    createUser: async (
      _,
      {
        name,
        phone,
        address,
        mainLocation,
        startDate,
        role = 'PHOTOGRAPHER',
        hasVehicle = false,
        birthDate,
        gender,
        status,
        memo,
      },
    ) => {
      const user = new User({
        name,
        phone,
        address,
        mainLocation,
        startDate,
        role,
        hasVehicle,
        birthDate,
        gender,
        status,
        memo,
      });
      return await user.save();
    },

    updateUser: async (
      _,
      {
        id,
        name,
        phone,
        address,
        mainLocation,
        hasVehicle,
        startDate,
        birthDate,
        gender,
        status,
        memo,
      },
    ) => {
      const user = await User.findOne({ id });
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      Object.assign(
        user,
        Object.fromEntries(
          Object.entries({
            name,
            phone,
            address,
            mainLocation,
            hasVehicle,
            startDate,
            birthDate,
            gender,
            status,
            memo,
          }).filter(([, v]) => v !== undefined),
        ),
      );
      return await user.save();
    },

    deleteUser: async (_, { id }, context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('관리자 권한이 필요합니다.');
      }
      const user = await User.findOne({ id });
      if (user) {
        await User.findOneAndDelete({ id });
        return true;
      }
      return false;
    },
  },
};

export const checkUserExistsByPhone = withDb(
  async function checkUserExistsByPhone(phone) {
    try {
      const user = await User.findOne({ phone });
      return !!user;
    } catch (error) {
      console.error('User 존재 여부 확인 오류:', error);
      return false;
    }
  },
);

export const findUserByPhone = withDb(async function findUserByPhone(
  phone,
  name = null,
) {
  try {
    const query = { phone };
    if (name) query.name = name;
    const user = await User.findOne(query);
    return user;
  } catch (error) {
    console.error('User 찾기 오류:', error);
    return null;
  }
});

export const findUserById = withDb(async function findUserById(id) {
  try {
    const user = await User.findOne({ id });
    return user;
  } catch (error) {
    console.error('User 찾기 오류:', error);
    return null;
  }
});

// 로그인시 사용 (NextAuth : credentials)
export const verifyUserCredentials = withDb(
  async function verifyUserCredentials(phone, name) {
    try {
      const user = await User.findOne({ phone });
      if (!user) {
        return {
          success: false,
          user: null,
          error: '사용자를 찾을 수 없습니다.',
        };
      }
      if (user.name !== name) {
        return {
          success: false,
          user: null,
          error: '이름이 일치하지 않습니다.',
        };
      }
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          address: user.address,
          mainLocation: user.mainLocation,
          hasVehicle: user.hasVehicle,
          startDate: user.startDate,
        },
        error: null,
      };
    } catch (error) {
      console.error('User 인증 확인 오류:', error);
      return { success: false, user: null, error: '서버 오류가 발생했습니다.' };
    }
  },
);
