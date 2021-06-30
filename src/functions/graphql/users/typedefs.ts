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

    extend type Query {
        getUserById(userId: ID!): User!
        getAllUsers: [User]
        me: User!
    }

    extend type Mutation {
        updateProfile(user: UserInput!): User!
    }
`;
