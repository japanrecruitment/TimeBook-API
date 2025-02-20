import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { SpaceTypeObject } from ".";
import { GqlError } from "../../../error";

type SpaceTypeByIdArgs = { id: string };

type SpaceTypeByIdResult = Promise<Array<SpaceTypeObject>>;

type SpaceTypeById = IFieldResolver<any, Context, SpaceTypeByIdArgs, SpaceTypeByIdResult>;

const spaceTypeById: SpaceTypeById = async (_, { id }, { dataSources, store }) => {
    const cacheKey = `space-types:id:${id}`;
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const spaceTypeById = await store.spaceType.findUnique({ where: { id } });

    if (!spaceTypeById) throw new GqlError({ code: "NOT_FOUND", message: "スペースタイプが見つかりません" });

    dataSources.redis.store(cacheKey, spaceTypeById, 600);
    return spaceTypeById;
};

export const spaceTypeByIdTypeDefs = gql`
    type Query {
        spaceTypeById(id: ID!): SpaceTypeObject!
    }
`;

export const spaceTypeByIdResolvers = {
    Query: { spaceTypeById },
};
