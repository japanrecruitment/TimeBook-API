import { gql } from "apollo-server-core";

export type PaginationOption = {
    take: number;
    skip: number;
};

export const paginationOptionTypeDefs = gql`
    input PaginationOption {
        take: Int
        skip: Int
    }
`;
