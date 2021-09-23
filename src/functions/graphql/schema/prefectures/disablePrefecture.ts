import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type DisablePrefecture = IFieldResolver<any, Context, Record<"id", number>, Promise<Result>>;

const disablePrefecture: DisablePrefecture = async (_, { id }, { store, dataSources }) => {
    const updatedPrefecture = await store.prefecture.update({ where: { id }, data: { available: false } });
    if (!updatedPrefecture) throw new GqlError({ code: "BAD_REQUEST", message: "Prefecture not found" });
    dataSources.redis.deleteMany("prefectures:*");
    return { message: `Successfully disabled prefecture named ${updatedPrefecture.name}` };
};

export const disablePrefectureTypeDefs = gql`
    type Mutation {
        disablePrefecture(id: IntID!): Result @auth(requires: [admin])
    }
`;

export const disablePrefectureResolvers = {
    Mutation: { disablePrefecture },
};
