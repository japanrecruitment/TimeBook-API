import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type EnablePrefecture = IFieldResolver<any, Context, Record<"id", number>, Promise<Result>>;

const enablePrefecture: EnablePrefecture = async (_, { id }, { store, dataSources }) => {
    const updatedPrefecture = await store.prefecture.update({ where: { id }, data: { available: true } });
    if (!updatedPrefecture) throw new GqlError({ code: "BAD_REQUEST", message: "Prefecture not found" });
    dataSources.redis.deleteMany("prefectures:*");
    return { message: `Successfully enabled prefecture named ${updatedPrefecture.name}` };
};

export const enablePrefectureTypeDefs = gql`
    type Mutation {
        enablePrefecture(id: IntID!): Result @auth(requires: [admin])
    }
`;

export const enablePrefectureResolvers = {
    Mutation: { enablePrefecture },
};
