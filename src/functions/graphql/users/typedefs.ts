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
        updateProfile(user: UserInput!): User!
    }
`;
