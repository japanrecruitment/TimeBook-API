import { gql } from "apollo-server-lambda";

export default gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
        email: String @self @auth(requires: admin)
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
