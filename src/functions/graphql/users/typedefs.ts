import { gql } from "apollo-server-lambda";

// || @auth(requires: admin)

export default gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
        email: String @self
    }

    input UserInput {
        firstName: String
        lastName: String
        bio: String
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input RegisterInput {
        email: String!
        password: String!
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
    }

    input ResetPasswordInput {
        email: String!
        newPassword: String!
        code: Int!
    }

    input VerifyCodeInput {
        email: String!
        code: Int!
    }

    type LoginResult {
        user: User!
        token: String!
        refreshToken: String!
    }

    type RegisterResult {
        email: String!
        message: String!
    }

    extend type Query {
        getUserById(userId: ID!): User
        getAllUsers: [User]
        me: User!
    }

    extend type Mutation {
        login(input: LoginInput): LoginResult!
        register(input: RegisterInput!): RegisterResult!
        forgotPassword(email: String!): Result!
        resendVerificationCode(email: String!): Result!
        resetPassword(input: ResetPasswordInput!): Result!
        verifyEmail(input: VerifyCodeInput!): Result!
        verifyResetPasswordCode(input: VerifyCodeInput!): Result!
    }
`;
