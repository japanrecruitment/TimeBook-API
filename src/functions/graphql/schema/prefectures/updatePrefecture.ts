import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";

type UpdatePrefecture = IFieldResolver<any, Context, Record<"input", Prefecture>, Promise<Partial<Prefecture>>>;

const updatePrefecture: UpdatePrefecture = async (_, { input }, { store, dataSources }, info) => {
    const select = toPrismaSelect(mapSelections(info));
    const { id, ...data } = input;
    const updatedPrefecture = await store.prefecture.update({ where: { id }, data, ...select });
    dataSources.cacheDS.delete("all-prefectures");
    dataSources.cacheDS.delete("available-prefectures");
    return updatedPrefecture;
};

export const updatePrefectureTypeDefs = gql`
    input UpdatePrefectureInput {
        id: IntID!
        name: String
        nameKana: String
        nameRomaji: String
        available: Boolean
    }

    type Mutation {
        updatePrefecture(input: UpdatePrefectureInput!): Prefecture @auth(requires: [admin])
    }
`;

export const updatePrefectureResolvers = {
    Mutation: { updatePrefecture },
};
