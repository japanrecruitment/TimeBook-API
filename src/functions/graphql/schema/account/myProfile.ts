import { gql } from "apollo-server-core";

export const myProfileTypeDefs = gql`
    type Query {
        myProfile: Profile
    }
`;
