import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { SpaceType } from "@prisma/client";
import { GqlError } from "../../error";

type UpdateSpaceTypeInput = {
    title: string;
    description: string;
    id: string;
};

type UpdateSpaceType = IFieldResolver<any, Context, Record<"input", UpdateSpaceTypeInput>, Promise<SpaceType>>;

const updateSpaceType: UpdateSpaceType = async (_, { input }, { store, dataSources }) => {
    let { title, description, id } = input;
    const isValid = title.trim() && description.trim();
    if (!id || !isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    // check spcae type with same name
    const spaceTypeWithSimilarTitle = await store.spaceType.findFirst({ where: { title } });
    if (spaceTypeWithSimilarTitle)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "The title for space type is already in use" });

    const updatedSpaceType = await store.spaceType.update({
        where: {
            id: id,
        },
        data: {
            title: title,
            description: description,
        },
    });
    dataSources.redis.deleteMany("space-types:*");
    return updatedSpaceType;
};
export const updateSpaceTypeTypeDefs = gql`
    input UpdateSpaceTypeInput {
        id: ID!
        title: String!
        description: String!
    }

    type Mutation {
        updateSpaceType(input: UpdateSpaceTypeInput!): SpaceType! @auth(requires: [admin])
    }
`;

export const updateSpaceTypeResolvers = {
    Mutation: { updateSpaceType },
};
