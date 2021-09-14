import { IFieldResolver } from "@graphql-tools/utils";
import { TrainLine } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";

type LineByID = IFieldResolver<any, Context, Record<"id", number>, Promise<TrainLine[]>>;

const lineByID: LineByID = async (_, { id }, { store, dataSources }) => {
    const cacheDoc = await dataSources.redis.fetch(`line-${id}`);
    if (cacheDoc) return cacheDoc;
    const line = await store.trainLine.findUnique({ where: { id } });
    if (!line) throw new GqlError({ code: "NOT_FOUND", message: "Couldn't find the train line" });
    dataSources.redis.store(`line-${id}`, line, 600);
    return line;
};

export const lineByIDTypeDefs = gql`
    type Query {
        lineByID(id: IntID!): Line
    }
`;

export const lineByIDResolvers = {
    Query: { lineByID },
};
