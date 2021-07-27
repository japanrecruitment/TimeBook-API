import { gql } from "apollo-server-core";

export type PaginationOptions = {
    limit: number;
    skip: number;
};

export const paginationOptionsTypeDefs = gql`
    input PaginationOptions {
        limit: Int
        skip: Int
    }
`;
