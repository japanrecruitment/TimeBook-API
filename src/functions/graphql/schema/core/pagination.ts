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

export type PaginationResult<T> = {
    data: Array<T>;
    paginationInfo: PaginationInfo;
};

export const createPaginationResultType = (typeName: string, resultType: string) => {
    return `
        type ${typeName} {
            data: [${resultType}]
            paginationInfo: PaginationInfo
        }
    `;
};

export const createPaginationResult = <T>(data: Array<T>, take?: number, skip?: number): PaginationResult<T> => {
    return {
        data: take ? data.slice(0, take) : data,
        paginationInfo: {
            hasNext: take ? data.length > take : false,
            hasPrevious: skip ? skip > 0 : false,
        },
    };
};
