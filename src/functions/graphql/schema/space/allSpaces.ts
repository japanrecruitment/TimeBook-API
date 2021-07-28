import { IFieldResolver } from "@graphql-tools/utils";
import { Space, SpaceType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { PaginationOption } from "../core/paginationOption";

export type SpaceResult = Space & { spaceTypes?: SpaceType[] };

type AllSpaceArgs = {
    paginate: PaginationOption;
};

type AllSpaces = IFieldResolver<any, Context, AllSpaceArgs, Promise<SpaceResult[]>>;

const allSpaces: AllSpaces = async (_, { paginate }, { store }) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        include: { spaceTypes: { include: { spaceType: true } } },
        take,
        skip,
    });

    const result = allSpaces.map((space) => {
        const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);
        return { ...space, spaceTypes };
    });

    return result || [];
};

export const allSpacesTypeDefs = gql`
    type Space {
        id: ID!
        name: String
        maximumCapacity: String
        numberOfSeats: Int
        spaceSize: Float
        needApproval: Boolean
        spaceTypes: [SpaceType]
    }

    type Query {
        allSpaces(paginate: PaginationOption): [Space]
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
