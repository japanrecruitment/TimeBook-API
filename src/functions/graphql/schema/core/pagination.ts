import { gql } from "apollo-server-core";

export type PaginationOption = {
    take: number;
    skip: number;
    after?: string | number;
};

export type PaginationInfo = {
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string | number;
};

export const paginationTypeDefs = gql`
    enum SortOrder {
        asc
        desc
    }

    input PaginationOption {
        take: Int
        skip: Int
        after: Base64
    }

    type PaginationInfo {
        hasNext: Boolean
        hasPrevious: Boolean
        nextCursor: Base64
    }
`;

type PaginatedData = { id: string | number };

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

export const createPaginationResult = <T extends PaginatedData>(
    data: Array<T>,
    take?: number,
    skip?: number,
    after?: string | number
): PaginationResult<T> => {
    const paginatedData = take ? data.slice(0, take) : data;
    const hasNext = take ? data.length > take : false;
    const hasPrevious = after ? true : skip ? skip > 0 : false;
    const nextCursor = hasNext ? paginatedData[paginatedData.length - 1]?.id : undefined;
    return {
        data: paginatedData,
        paginationInfo: {
            hasNext,
            hasPrevious,
            nextCursor,
        },
    };
};
