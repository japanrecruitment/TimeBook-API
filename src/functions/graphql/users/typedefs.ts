import { gql } from "apollo-server-lambda";

// email: String @self @auth(requires: admin)
export default gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String
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
