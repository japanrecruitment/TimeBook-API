import { gql } from "apollo-server-lambda";

export default gql`
    type User {
        id: ID!
        firstName: String! @upperFirstLetter
        lastName: String! @upperFirstLetter
        email: String @self @auth(requires: admin)
    }

    input UserInput {
        firstName: String
        lastName: String
        bio: String
    }

    extend type Query {
        getUserById(userId: ID!): User!
        me: User!
    }

    extend type Mutation {
        updateProfile(user: UserInput!): User!
    }
`;
