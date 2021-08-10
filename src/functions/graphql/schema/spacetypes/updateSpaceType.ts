import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { SpaceType } from "@prisma/client";
import { GqlError } from "../../error";

type UpdateSpaceTypeInput = {
    title: string;
    description: string;
    id: string;
    photoGalleryId: string;
};

type UpdateSpaceType = IFieldResolver<any, Context, Record<"input", UpdateSpaceTypeInput>, Promise<SpaceType>>;

const updateSpaceType: UpdateSpaceType = async (_, { input }, { store }) => {
    let { title, description, id, photoGalleryId } = input;
    const isValid = title.trim() && description.trim();
    if (!id || !isValid || !photoGalleryId)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });
    const spaceTypeWithSimilarTitle = await store.spaceType.findFirst({ where: { title } });
    if (spaceTypeWithSimilarTitle)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "The title for space type is already in use" });
    const originalSpaceType = await store.spaceType.findUnique({
        where: { id },
        include: {
            Media: {
                select: { photoGalleryId: true },
            },
        },
    });
    const previousImageOfSpaceType = originalSpaceType.Media.photoGalleryId;

    const updatedSpaceType = await store.spaceType.update({
        where: {
            id: id,
        },
        data: {
            title: title,
            description: description,
            Media: {
                create:
                    previousImageOfSpaceType != photoGalleryId
                        ? {
                              photoGalleryId,
                          }
                        : undefined,
            },
        },
    });

    return updatedSpaceType;
};
export const updateSpaceTypeTypeDefs = gql`
    input UpdateSpaceTypeInput {
        id: ID!
        title: String!
        description: String!
        photoGalleryId: String!
    }

    type Mutation {
        updateSpaceType(input: UpdateSpaceTypeInput!): SpaceType! @auth(requires: [user, host])
    }
`;

export const updateSpaceTypeResolvers = {
    Mutation: { updateSpaceType },
};
