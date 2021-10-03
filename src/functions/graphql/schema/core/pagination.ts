import { gql } from "apollo-server-core";

export type PaginationOption = {
    take: number;
    skip: number;
};

export type PaginationInfo = {
    hasNext: boolean;
    hasPrevious: boolean;
};

export const paginationTypeDefs = gql`
    input PaginationOption {
        take: Int
        skip: Int
    }

    type PaginationInfo {
        hasNext: Boolean
        hasPrevious: Boolean
    }
`;
