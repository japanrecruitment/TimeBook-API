import { gql } from "apollo-server-core";

export type Result = {
    message: string;
    action?: string;
};

export const resultTypeDefs = gql`
    type Result {
        message: String!
        action: String
    }
`;
