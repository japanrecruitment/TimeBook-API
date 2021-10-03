import { gql } from "apollo-server-core";

export type PaginationInfo = {
    hasNext: boolean;
    hasPrevious: boolean;
};

export const paginationInfoTypeDefs = gql`
    type PaginationInfo {
        hasNext: Boolean
        hasPrevious: Boolean
    }
`;
